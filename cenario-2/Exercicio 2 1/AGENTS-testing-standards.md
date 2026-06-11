# AGENTS.md — NovaTech RAG Assistant

> Este arquivo define padrões e convenções para desenvolvimento assistido por IA neste projeto.
> Todos os agentes (Copilot, Cursor, Claude, etc.) **DEVEM** seguir estas diretrizes ao gerar ou modificar código.

---

## Testing Standards

### Visão Geral

Este projeto usa **Vitest** para testes unitários e de integração, **msw (Mock Service Worker)** para mock de HTTP, e executa todos os testes no **GitHub Actions CI**. Cobertura mínima de linhas: **80%**.

Estes padrões existem porque testes gerados por IA tendem a ser estruturalmente válidos, mas semanticamente fracos — eles passam sem verificar comportamento real. O objetivo aqui é que os testes **falhem pelos motivos certos** e **passem apenas quando o sistema realmente funciona**.

---

### 1. Organização das Suítes de Teste

Separe os arquivos de teste por escopo. Não misture preocupações unitárias e de integração no mesmo arquivo.

```
src/
├── query/
│   ├── queryHandler.ts
│   ├── queryHandler.unit.test.ts         ← unitário: lógica isolada, sem I/O
│   └── queryHandler.integration.test.ts  ← integração: HTTP, DB, pipeline completo
├── retrieval/
│   ├── retriever.ts
│   ├── retriever.unit.test.ts
│   └── retriever.integration.test.ts
tests/
├── fixtures/
│   ├── questions.ts       ← perguntas RAG reutilizáveis
│   ├── chunks.ts          ← chunks de documentos retornados pelo retriever
│   └── ragResponses.ts    ← respostas esperadas do LLM
├── factories/
│   ├── chunkFactory.ts    ← constrói objetos Chunk com defaults + overrides
│   └── queryFactory.ts    ← constrói objetos QueryRequest
└── msw/
    ├── handlers.ts        ← handlers de requisição msw
    └── server.ts          ← setup/teardown do servidor msw
```

#### O que caracteriza um teste unitário

- Testa **uma única função ou classe** em isolamento
- **Zero** chamadas de rede reais, leituras de banco ou acesso ao sistema de arquivos
- Todas as dependências são substituídas por mocks, stubs ou fakes
- Executa em **milissegundos**
- Sufixo do arquivo: `.unit.test.ts`

```typescript
// ✅ Unit test: tests pure scoring logic, no external dependencies
describe('RankingService', () => {
  it('returns chunks sorted by relevance score in descending order', () => {
    const chunks = [
      chunkFactory({ score: 0.6 }),
      chunkFactory({ score: 0.9 }),
      chunkFactory({ score: 0.4 }),
    ];

    const result = rankByRelevance(chunks);

    expect(result[0].score).toBe(0.9);
    expect(result[1].score).toBe(0.6);
    expect(result[2].score).toBe(0.4);
  });
});
```

#### O que caracteriza um teste de integração

- Testa **como dois ou mais módulos funcionam juntos**
- Pode envolver chamadas HTTP reais para um servidor **mockado** via msw — nunca para produção
- Pode envolver bancos de dados em memória ou test containers
- Valida o **contrato** entre fronteiras do sistema
- Sufixo do arquivo: `.integration.test.ts`

```typescript
// ✅ Integration test: tests the full query pipeline with msw intercepting HTTP
describe('QueryHandler (integration)', () => {
  it('returns a grounded answer when the retriever finds relevant chunks', async () => {
    // msw intercepts the call to the embedding API — no real network
    server.use(
      http.post('https://api.openai.com/v1/embeddings', () =>
        HttpResponse.json(embeddingFixture.singleVector)
      )
    );

    const request = queryFactory({ question: questions.trackingDelay });
    const response = await queryHandler(request);

    expect(response.statusCode).toBe(200);
    expect(response.answer).toContain('estimated delivery');
    expect(response.sources).toHaveLength(2);
  });
});
```

---

### 2. Convenções de Nomenclatura

Use `describe` + `it` com **frases completas em inglês**. O nome do teste deve comunicar *o que* está sendo testado, *sob qual condição* e *qual é o resultado esperado*.

Padrão: `[Unidade] > [cenário] > [resultado esperado]`

```typescript
// ❌ BAD — tells you nothing when it fails in CI
test('query endpoint works', async () => { ... });
test('handler', async () => { ... });
test('returns result', async () => { ... });

// ✅ GOOD — reads like a specification
describe('QueryHandler', () => {
  describe('when the question is valid and chunks are found', () => {
    it('returns HTTP 200 with a non-empty answer and source references', async () => { ... });
  });

  describe('when the question body is missing', () => {
    it('returns HTTP 400 with a descriptive validation error message', async () => { ... });
  });

  describe('when the embedding API is unavailable', () => {
    it('returns HTTP 503 and does not expose internal error details', async () => { ... });
  });
});
```

**Regras:**
- Bloco `describe` → a **unidade sob teste** (classe, função, módulo)
- `describe` aninhado → a **condição ou cenário**
- `it` → o **resultado observável esperado**
- Nunca use "should" — escreva como fato, não como desejo ("returns", não "should return")
- O nome do teste deve ser legível sem precisar olhar o código

---

### 3. O que todo teste DEVE ter

#### Estrutura Arrange / Act / Assert (AAA)

Todo teste deve ter três fases claramente separadas. Adicione comentários quando o teste for não-trivial.

```typescript
it('returns the top 3 chunks ranked by score when more than 3 are retrieved', async () => {
  // ARRANGE — set up inputs and preconditions
  const chunks = [
    chunkFactory({ score: 0.5, content: 'low relevance' }),
    chunkFactory({ score: 0.95, content: 'high relevance' }),
    chunkFactory({ score: 0.7, content: 'medium relevance' }),
    chunkFactory({ score: 0.3, content: 'very low relevance' }),
  ];

  // ACT — execute the unit under test
  const result = selectTopChunks(chunks, { limit: 3 });

  // ASSERT — verify the outcome
  expect(result).toHaveLength(3);
  expect(result[0].content).toBe('high relevance');
  expect(result[1].content).toBe('medium relevance');
  expect(result[2].content).toBe('low relevance');
});
```

#### Assertions específicas e com significado

Assertions devem verificar **valores concretos**, não apenas a existência de uma resposta.

```typescript
// ❌ BAD — passes even if the function returns `true` or an empty string
expect(result).toBeDefined();
expect(result).toBeTruthy();
expect(response).not.toBeNull();

// ✅ GOOD — verifies exact shape and values
expect(response.statusCode).toBe(200);
expect(response.body.answer).toMatch(/transit time/i);
expect(response.body.sources).toEqual([
  expect.objectContaining({ chunkId: 'chunk-42', score: expect.any(Number) }),
]);
```

#### Um comportamento principal por teste

Cada bloco `it` testa **uma coisa**. Se você se pegar escrevendo "and" no nome do teste, divida-o.

```typescript
// ❌ BAD — two behaviors, one failure masks the other
it('validates input and calls the retriever and formats the response', async () => { ... });

// ✅ GOOD — each behavior gets its own test
it('rejects requests with an empty question string', async () => { ... });
it('calls the retriever with the normalized question text', async () => { ... });
it('formats the retriever output into the expected response shape', async () => { ... });
```

---

### 4. O que todo teste NÃO DEVE ter

#### Chamadas reais a serviços externos

Nenhum teste pode jamais chamar uma API real, banco de dados ou caminho de sistema de arquivos que não esteja sob controle do teste.

```typescript
// ❌ FORBIDDEN — calls the real OpenAI API
const embedding = await openai.embeddings.create({ input: question });

// ❌ FORBIDDEN — reads from a real database
const chunks = await db.collection('documents').find({}).toArray();

// ✅ CORRECT — msw intercepts the HTTP call
server.use(
  http.post('https://api.openai.com/v1/embeddings', () =>
    HttpResponse.json(fixtures.embedding.valid)
  )
);
```

**Por que isso importa especialmente em sistemas RAG:** modelos de embedding e bancos vetoriais têm latência, custo, rate limits e saídas não-determinísticas. Um teste que depende deles é lento, instável e não pode ser confiado no CI.

#### Testes dependentes de ordem

Todo teste deve ser capaz de executar em isolamento. Se o teste B só passa porque o teste A executou antes, você tem uma dependência oculta — não uma suíte de testes.

```typescript
// ❌ BAD — relies on state set by a previous test
it('updates the document chunk', async () => {
  // assumes 'chunk-1' was created by a test that ran earlier
  await updateChunk('chunk-1', { content: 'updated' });
  expect(...);
});

// ✅ GOOD — creates its own preconditions
it('updates the document chunk', async () => {
  const chunk = await createChunk(chunkFactory({ id: 'chunk-1' }));
  await updateChunk(chunk.id, { content: 'updated' });
  expect(...);
});
```

Use `beforeEach` para resetar estado compartilhado. Use `afterEach` para limpeza.

#### Assertions vagas ou sem valor

Se uma assertion passaria mesmo com a funcionalidade quebrada, ela não tem valor.

```typescript
// ❌ These assertions prove almost nothing:
expect(result).toBeDefined();
expect(result).not.toBeNull();
expect(response.status).toBeTruthy();    // passes for 404, 500, anything non-zero
expect(answer.length).toBeGreaterThan(0); // passes for a single space character

// ✅ Assert the specific contract you care about:
expect(response.status).toBe(200);
expect(answer).toMatch(/delivery|shipment|tracking/i);
expect(chunks).toHaveLength(3);
expect(chunks[0]).toEqual(expect.objectContaining({ score: expect.any(Number) }));
```

#### Valores mágicos hardcoded sem contexto

```typescript
// ❌ BAD — what is "42"? what is "0.87"?
expect(result.chunkId).toBe('42');
expect(result.score).toBe(0.87);

// ✅ GOOD — name your constants or derive from fixtures
const { chunkId, score } = fixtures.chunks.highRelevance;
expect(result.chunkId).toBe(chunkId);
expect(result.score).toBeCloseTo(score, 2);
```

---

### 5. Validação de Conteúdo: mustContain e mustNotContain

Esta é uma das seções mais críticas para sistemas RAG e é sistematicamente ignorada em testes gerados por IA.

#### O problema central

Um teste pode passar verde e ainda assim o usuário final receber uma resposta **incorreta, perigosa ou enganosa**. Isso acontece quando validamos apenas a existência de uma resposta, sem verificar o que ela contém — e, igualmente importante, o que ela **não deve conter**.

**A regra de negócio deve guiar o que você valida, não a conveniência técnica.**

Pergunte sempre: *"Se este teste passar, o usuário final está recebendo a resposta correta?"*

#### mustContain — valide a presença do conteúdo esperado

Não basta verificar que a resposta existe ou que tem mais de zero caracteres. Valide que ela contém **os termos e informações que a regra de negócio exige**.

```typescript
// ❌ BAD — passes even if the answer is "I don't know" or a random string
it('returns an answer about delivery time', async () => {
  const response = await queryHandler(queryFactory({ question: questions.deliveryTime }));

  expect(response.answer).toBeDefined();
  expect(response.answer.length).toBeGreaterThan(0);
});

// ✅ GOOD — validates the business rule: answer must contain delivery timeframe
it('returns an answer that includes the delivery timeframe for standard shipping', async () => {
  const response = await queryHandler(queryFactory({ question: questions.deliveryTime }));

  expect(response.statusCode).toBe(200);
  // The business rule: answer MUST reference a concrete number of days
  expect(response.answer).toMatch(/\d+\s*(to\s*\d+)?\s*business days/i);
  // The answer MUST be grounded in the source document
  expect(response.sources).toHaveLength(greaterThanOrEqual(1));
});
```

#### mustNotContain — valide a ausência do conteúdo proibido

Esta dimensão é quase sempre esquecida. Em sistemas RAG, uma resposta pode ser tecnicamente não-vazia e conter a palavra certa, mas também conter **informação que não deveria estar lá**: dados de outro cliente, informação desatualizada, alucinação do LLM, ou mensagem de erro exposta.

```typescript
// ❌ BAD — doesn't check what the answer must NOT say
it('returns a safe response when no chunks are found', async () => {
  server.use(
    http.post('https://your-vector-db/query', () =>
      HttpResponse.json({ chunks: [] })
    )
  );

  const response = await queryHandler(queryFactory({ question: questions.outOfScope }));

  expect(response.answer).toBeDefined(); // passes even if answer leaks internal errors
});

// ✅ GOOD — validates both what must be present AND what must be absent
it('returns a scoped fallback message without leaking internal details', async () => {
  server.use(
    http.post('https://your-vector-db/query', () =>
      HttpResponse.json({ chunks: [] })
    )
  );

  const response = await queryHandler(queryFactory({ question: questions.outOfScope }));

  // mustContain: the answer must communicate the limitation clearly
  expect(response.answer).toMatch(/don't have.*information|not able to answer/i);
  expect(response.groundingConfidence).toBe('none');

  // mustNotContain: the answer must NOT expose internals or fabricate information
  expect(response.answer).not.toMatch(/error|exception|stack trace|undefined/i);
  expect(response.answer).not.toMatch(/openai|vector|embedding|database/i);
  expect(response.answer).not.toContain('Paris'); // must not hallucinate out-of-scope answers
});
```

#### Casos críticos onde mustNotContain é obrigatório

Os cenários abaixo exigem validação negativa explícita em todo teste que os cubra:

| Cenário | O que NÃO pode aparecer na resposta |
|---|---|
| Pergunta fora do escopo da base de conhecimento | Respostas fabricadas pelo LLM sem grounding |
| Falha no serviço externo (embedding, vector DB) | Stack traces, nomes de serviços internos, chaves de API |
| Pergunta ambígua com baixo score de similaridade | Conteúdo de chunks não relacionados |
| Resposta sobre prazo ou política | Valores desatualizados que existiam em versões anteriores do documento |
| Qualquer resposta ao usuário final | Tokens de debug, IDs internos, mensagens de log |

```typescript
// Exemplo completo: mustContain + mustNotContain em um cenário de política de entrega
it('returns the current delivery policy without exposing outdated values or internal IDs', async () => {
  // ARRANGE
  server.use(
    http.post('https://your-vector-db/query', () =>
      HttpResponse.json({ chunks: [chunks.highRelevance] })
    )
  );

  // ACT
  const response = await queryHandler(
    queryFactory({ question: questions.deliveryTime })
  );

  // ASSERT — mustContain: business rule requires specific, grounded information
  expect(response.statusCode).toBe(200);
  expect(response.answer).toMatch(/3 to 5 business days/i);
  expect(response.sources[0].chunkId).toBe(chunks.highRelevance.id);

  // ASSERT — mustNotContain: must not regress to old policy or leak internals
  expect(response.answer).not.toMatch(/7 to 10 business days/i); // old policy value
  expect(response.answer).not.toMatch(/chunk-|chunkId|score:/i);  // internal fields
  expect(response.answer).not.toMatch(/error|undefined|null/i);   // error leakage
});
```

#### Por que a IA gera testes sem mustNotContain

Agentes de IA otimizam para testes que passam. `toBeDefined()` sempre passa. Validações negativas exigem conhecimento do domínio e das regras de negócio — contexto que o agente não tem, a menos que seja fornecido explicitamente. **Por isso este arquivo existe.**

Ao revisar testes gerados por IA, verifique ativamente: *"Este teste passaria se o sistema retornasse uma resposta completamente errada, mas não-vazia?"* Se a resposta for sim, o teste está incompleto.

---

### 6. Padrão de Mocking

#### HTTP — sempre use msw

Todas as chamadas HTTP para APIs externas (OpenAI, modelos de embedding, bancos vetoriais via HTTP) devem ser interceptadas com **msw**. Nunca use `vi.mock` para stubbar `fetch` ou `axios` diretamente em testes de fronteira HTTP.

```typescript
// tests/msw/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Single server instance shared across all integration tests
export const server = setupServer(...handlers);
```

```typescript
// tests/msw/handlers.ts
import { http, HttpResponse } from 'msw';
import { fixtures } from '../fixtures';

export const handlers = [
  // Default handler — returns a valid embedding
  http.post('https://api.openai.com/v1/embeddings', () =>
    HttpResponse.json(fixtures.embedding.singleVector)
  ),

  // Default handler — returns a valid vector search result
  http.post('https://your-vector-db/query', () =>
    HttpResponse.json(fixtures.vectorSearch.threeChunks)
  ),
];
```

```typescript
// In your test file — override per-test when testing error paths
describe('QueryHandler (integration)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers()); // ← critical: prevents handler bleed between tests
  afterAll(() => server.close());

  it('returns HTTP 503 when the embedding API times out', async () => {
    // Override the default handler for this specific test
    server.use(
      http.post('https://api.openai.com/v1/embeddings', () =>
        HttpResponse.error() // simulates network failure
      )
    );

    const response = await queryHandler(queryFactory({ question: questions.generic }));

    expect(response.statusCode).toBe(503);
    expect(response.body.error).toBe('upstream_unavailable');

    // mustNotContain: error message must not leak implementation details
    expect(response.body.error).not.toMatch(/openai|fetch|ECONNREFUSED/i);
  });
});
```

**Nota sobre `onUnhandledRequest: 'error'`:** força qualquer chamada HTTP não coberta por um handler a lançar erro. Impede que testes façam chamadas reais de rede silenciosamente quando um handler estiver faltando.

#### Dados — sempre use factories

Nunca inline objetos literais como dados de teste. Use **funções factory** que fornecem defaults sensatos e aceitam overrides parciais.

```typescript
// tests/factories/chunkFactory.ts
import type { DocumentChunk } from '../../src/types';

// Default values represent a "valid, typical" chunk
const defaults: DocumentChunk = {
  id: 'chunk-default',
  content: 'Shipments typically arrive within 3 to 5 business days.',
  score: 0.82,
  metadata: {
    source: 'logistics-faq.pdf',
    page: 4,
    section: 'Delivery Times',
  },
};

// Factory accepts partial overrides — only specify what matters for your test
export function chunkFactory(overrides: Partial<DocumentChunk> = {}): DocumentChunk {
  return { ...defaults, ...overrides };
}
```

```typescript
// Usage in tests
const lowScoreChunk = chunkFactory({ score: 0.1 });
const customContentChunk = chunkFactory({ content: 'Customs clearance may cause delays.' });
const multipleChunks = [chunkFactory({ id: 'c1' }), chunkFactory({ id: 'c2' })];
```

**Por que factories em vez de objetos literais:** quando o tipo `DocumentChunk` mudar (ex: novo campo obrigatório), você atualiza uma factory, não 40 arquivos de teste.

---

### 7. Padrão de Fixtures

Fixtures são **conjuntos de dados estáticos e pré-definidos** usados em múltiplos testes. Diferem das factories por não serem dinâmicos — representam cenários específicos e nomeados.

Armazene todas as fixtures em `tests/fixtures/`.

#### questions.ts — perguntas de entrada do RAG

```typescript
// tests/fixtures/questions.ts

export const questions = {
  // A question that should match logistics content with high confidence
  trackingDelay:
    'My shipment has been in transit for 10 days. What should I do?',

  // A question that should match multiple relevant chunks
  deliveryTime:
    'How long does standard shipping take to São Paulo?',

  // A question with no relevant content in the knowledge base
  outOfScope:
    'What is the capital of France?',

  // Edge case: very short question, minimal signal for embedding
  ambiguous: 'Delay?',

  // Edge case: question with special characters and mixed language
  mixedLanguage: 'Qual o prazo de entrega para zona rural?',
} as const;
```

#### chunks.ts — chunks de documentos retornados pelo retriever

```typescript
// tests/fixtures/chunks.ts
import type { DocumentChunk } from '../../src/types';

export const chunks = {
  // High-relevance chunk — should appear first in ranked results
  highRelevance: {
    id: 'chunk-001',
    content:
      'Standard shipping to major Brazilian capitals takes 3 to 5 business days after dispatch.',
    score: 0.94,
    metadata: { source: 'shipping-policy-2024.pdf', page: 2, section: 'Delivery SLAs' },
  } satisfies DocumentChunk,

  // Medium-relevance chunk — should appear in results but not first
  mediumRelevance: {
    id: 'chunk-002',
    content:
      'For remote areas, delivery times may extend to 10 business days due to last-mile constraints.',
    score: 0.71,
    metadata: { source: 'shipping-policy-2024.pdf', page: 3, section: 'Remote Delivery' },
  } satisfies DocumentChunk,

  // Low-relevance chunk — should be filtered out when threshold is applied
  lowRelevance: {
    id: 'chunk-003',
    content: 'Our returns policy allows exchanges within 30 days of purchase.',
    score: 0.28,
    metadata: { source: 'returns-policy.pdf', page: 1, section: 'Returns' },
  } satisfies DocumentChunk,

  // Convenience array — standard "retriever returned 2 relevant chunks" scenario
  twoRelevant: [] as DocumentChunk[], // populated below to avoid repetition
} as const;

// Populated separately to keep the object literal clean
(chunks as { twoRelevant: DocumentChunk[] }).twoRelevant = [
  chunks.highRelevance,
  chunks.mediumRelevance,
];
```

#### ragResponses.ts — respostas esperadas do LLM

```typescript
// tests/fixtures/ragResponses.ts
import type { RAGResponse } from '../../src/types';

export const ragResponses = {
  // Expected shape for a well-grounded answer with two sources
  groundedWithTwoSources: {
    answer:
      'Standard shipping to major capitals typically takes 3 to 5 business days after dispatch.',
    sources: [
      { chunkId: 'chunk-001', score: 0.94 },
      { chunkId: 'chunk-002', score: 0.71 },
    ],
    groundingConfidence: 'high',
  } satisfies RAGResponse,

  // Expected shape when no relevant chunks are found
  noRelevantChunks: {
    answer: "I don't have enough information to answer that question based on available documents.",
    sources: [],
    groundingConfidence: 'none',
  } satisfies RAGResponse,
} as const;
```

**Por que fixtures são críticas em sistemas RAG:** sistemas RAG têm múltiplos componentes probabilísticos (embeddings, scores de similaridade, geração do LLM). Testes que usam dados arbitrários e instáveis escondem regressões. Fixtures nomeadas tornam os cenários explícitos e auditáveis.

---

### 8. Referência de Anti-patterns

Os padrões abaixo são proibidos. O CI está configurado para sinalizar PRs onde estes aparecem em arquivos de teste novos.

| Anti-pattern | Por que é um problema | Abordagem correta |
|---|---|---|
| `expect(result).toBeDefined()` | Passa mesmo em respostas quebradas | Asserir valores e shape específicos |
| `test('works', ...)` | Mensagens de falha sem sentido no CI | Usar frases completas com `describe/it` |
| `await new Promise(r => setTimeout(r, 2000))` | Sleep arbitrário esconde problemas de timing | Usar `waitFor` ou corrigir o contrato assíncrono |
| Chamar APIs reais em testes | Instável, lento, custoso, não-determinístico | msw para HTTP, factories para dados |
| Estado mutável compartilhado entre testes | Cria dependência oculta de ordem | Resetar em `beforeEach` / `afterEach` |
| `vi.mock('../../services/openai')` para HTTP | Mocka o módulo, não a fronteira | Usar msw para testar o contrato HTTP |
| Assertir texto gerado pelo LLM literalmente | Output do LLM é não-determinístico | Usar `.toMatch(/keyword/i)` ou verificar estrutura |
| Usar apenas `toContain` sem `not.toContain` | Valida presença mas ignora conteúdo proibido | Sempre parear mustContain com mustNotContain onde a regra de negócio exige |

---

### 9. Política de Cobertura

- **Mínimo: 80% de cobertura de linhas** aplicado no CI — PRs abaixo do threshold são bloqueados
- Cobertura é um **piso, não uma meta**: 80% com assertions fracas é pior do que 70% com assertions significativas
- Excluídos dos requisitos de cobertura: `*.config.ts`, `types/`, `mocks/`, `fixtures/`
- **O que priorizar:** lógica de negócio, caminhos de tratamento de erros, validação de entrada, transformação de dados
- **O que não obcecar:** getters/setters triviais, boilerplate de framework, código auto-gerado

```json
// vitest.config.ts coverage thresholds
{
  "coverage": {
    "thresholds": {
      "lines": 80,
      "functions": 75,
      "branches": 70
    },
    "exclude": ["**/*.config.ts", "**/types/**", "**/fixtures/**", "**/factories/**"]
  }
}
```

---

> **Para agentes de IA gerando testes:** o critério não é "este teste passa". O critério é "este teste falha quando a funcionalidade está quebrada — e passa verde apenas quando o usuário final recebe a resposta correta". Sempre pergunte: *qual comportamento específico estou verificando, como eu saberia se ele regrediu, e o que esta resposta não deve conter?*
