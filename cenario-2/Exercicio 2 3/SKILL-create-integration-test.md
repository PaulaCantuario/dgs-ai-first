# SKILL: create-integration-test

> **Nível:** Artifact
> **Projeto:** NovaTech RAG Assistant (`db1/novatech-assistant`)
> **Última atualização:** 2026-06-10

---

## Dependências — leia antes de usar esta skill

Antes de gerar qualquer teste de integração, o agente **DEVE** ter lido:

| Caminho | Tipo | Por que é obrigatório |
|---|---|---|
| `AGENTS.md > Testing Standards` | Foundation | Define stack (Vitest + msw), estrutura de pastas, convenções de nomenclatura, padrão AAA, política de cobertura e anti-patterns proibidos |
| `tests/fixtures/questions.ts` | Domain | Perguntas RAG canônicas — nunca inline strings de pergunta nos testes |
| `tests/fixtures/chunks.ts` | Domain | Chunks de documento com scores de referência — nunca crie `DocumentChunk` inline |
| `tests/fixtures/ragResponses.ts` | Domain | Shapes de resposta esperados — use como âncora para assertions de estrutura |
| `tests/factories/chunkFactory.ts` | Domain | Factory com overrides parciais — obrigatório para variações de chunk |
| `tests/factories/queryFactory.ts` | Domain | Factory de `QueryRequest` — obrigatório para variações de entrada |
| `tests/msw/server.ts` + `handlers.ts` | Foundation | Servidor msw compartilhado — todos os testes de integração usam este setup |

> **Regra de ouro:** Se você não leu os arquivos acima, não gere o teste. As fixtures e factories existem para que você não precise inventar dados. Inventar dados é o principal vetor de testes semanticamente fracos.

---

## Quando esta skill se aplica

Use `create-integration-test` quando a tarefa for cobrir **como dois ou mais módulos do pipeline RAG funcionam juntos através de uma fronteira real** — tipicamente HTTP para serviços externos (Azure OpenAI, Azure AI Search) interceptados por msw, ou a integração entre o handler e o pipeline de query/retrieval.

**Frases-ativação que disparam esta skill:**

- "escreva um teste de integração para o `queryHandler`"
- "cubra o comportamento do pipeline quando o embedding falhar"
- "adicione testes para o cenário onde o retriever não encontra chunks"
- "teste a resposta da API quando a pergunta está fora do escopo"
- "valide que erros internos não vazam para o usuário"
- "crie teste para [TC-ID] do plano de testes" ← quando o TC é marcado como `Automatizado` ou `Híbrido`

**Esta skill NÃO se aplica para:**

- Testes unitários de funções puras isoladas → use `create-unit-test`
- Testes E2E via interface do Teams ou painel web → use `create-e2e-test`
- Testes de performance ou carga → escopo separado

---

## Domínio NovaTech — o que os testes devem proteger

Esta seção é **obrigatória antes de escrever qualquer assertion**. Testes de integração para este projeto não são exercícios técnicos genéricos: eles protegem regras de negócio reais de uma empresa de logística com 1.200 funcionários, cujos atendentes dependem do assistente para responder clientes sobre prazos, políticas e procedimentos.

**Um teste que passa, mas deixa uma regra de negócio desprotegida, é pior do que não ter o teste — porque cria falsa confiança.**

### Regras de negócio que os testes DEVEM verificar explicitamente

| Regra | O que o teste deve assertir | O que o teste deve rejeitar |
|---|---|---|
| Respostas devem ser fundamentadas em documentos reais da base da NovaTech | `sources` com pelo menos 1 chunk; `citation.documentName` referenciando documento real (ex: `shipping-policy-2024.pdf`) | Respostas sem fonte (`sources: []`) quando chunks existem |
| SLAs de entrega devem refletir a versão **mais recente** do documento | `answer` contendo prazo vigente (ex: "3 to 5 business days" para capitais) | `answer` contendo prazos de versões anteriores (ex: "7 to 10 business days") |
| Quando documentos se contradizem, a versão com metadado de vigência mais recente prevalece | `citation.documentName` referenciando o documento mais recente | Chunks de documentos marcados como obsoletos presentes em `sources` |
| Perguntas fora do escopo da base documental devem gerar fallback — nunca alucinação | `groundingConfidence: 'none'`; mensagem de limitação clara | Qualquer informação fabricada sobre tópico sem grounding |
| Citação deve sempre incluir: nome do documento, seção, página e URL de origem | `citation` com todos os 4 campos preenchidos e válidos | `citation` com campos ausentes, `null`, ou genéricos como `"document.pdf"` |
| Erros de serviço não devem expor detalhes técnicos ao atendente | Mensagem de erro amigável; código canônico | Stack trace, nome de serviço interno, chave de API, mensagem de rede |

### Documentos reais da base documental — use nos testes

Os chunks em `tests/fixtures/chunks.ts` devem referenciar documentos reais da base da NovaTech. Nunca use `source: 'test.pdf'` ou `source: 'document.pdf'`. Exemplos de documentos válidos:

```typescript
// ✅ Fontes reais — use exatamente estes nomes ao criar ou sobrescrever fixtures
'shipping-policy-2024.pdf'       // Política de frete e SLAs — Comercial
'returns-policy.pdf'             // Política de devolução — Operações
'compliance-manual-v3.pdf'       // Manual de compliance — Compliance
'sla-table-by-client-type.xlsx'  // Tabela de SLA por tipo de cliente — Comercial
'cargo-security-procedures.pdf'  // Procedimentos de segurança de carga — Operações
'complaint-handling-guide.pdf'   // Guia de procedimentos de reclamação — Operações

// ❌ Fontes inválidas — inventadas sem raiz no domínio NovaTech
'test.pdf'
'document.pdf'
'sample-doc.pdf'
'mock-data.pdf'
```

### Perguntas de domínio — use as fixtures, não invente

`tests/fixtures/questions.ts` contém perguntas que representam os ~192 chamados/dia da NovaTech que envolvem consulta documental (60% de 320). Nunca substitua por `"test"`, `"hello"` ou `"what is delivery?"`:

```typescript
// ✅ Perguntas reais que os 45 atendentes da NovaTech fazem
questions.trackingDelay    // "My shipment has been in transit for 10 days. What should I do?"
questions.deliveryTime     // "How long does standard shipping take to São Paulo?"
questions.outOfScope       // pergunta fora do domínio logístico
questions.ambiguous        // pergunta com sinal mínimo para embedding
questions.mixedLanguage    // "Qual o prazo de entrega para zona rural?" — cliente PT-BR

// ❌ Perguntas inválidas — nunca use
'{"question": "test"}'
'{"question": "hello"}'
'{"question": "what is delivery?"}'
```

---

## Cobertura vs. proteção de conteúdo — a distinção mais importante desta skill

> **80% de cobertura de linhas é o piso do CI. Não é a meta do teste.**

Um agente de IA que não entendeu esta distinção vai gerar testes que sobem o número de cobertura sem proteger nada de valor. O padrão deste projeto é explícito: **cobertura com assertions fracas é pior do que cobertura menor com assertions significativas.**

### O problema específico dos sistemas RAG: bugs de conteúdo

Sistemas RAG têm uma classe de bug que não existe em APIs convencionais: **a estrutura está correta, o status é 200, mas o conteúdo está errado ou fabricado.** Esses bugs passam invisíveis em qualquer teste que só verifique shape ou existência.

```typescript
// Exemplo de resposta que passa em 100% dos testes gerados por IA sem critério de domínio:
{
  statusCode: 200,
  body: {
    answer: "Shipments are typically delivered within 7 to 10 business days.",  // ← política desatualizada
    citation: {
      documentName: "shipping-policy-2021.pdf",  // ← documento obsoleto
      page: 5,
      url: "https://novatech.sharepoint.com/docs/shipping-policy-2021.pdf",
      sections: ["Old SLA Table"]
    },
    sources: [{ chunkId: "chunk-099", score: 0.61 }],
    groundingConfidence: "medium"
  }
}
```

Este response passaria em:
- `expect(response.statusCode).toBe(200)` ✅
- `expect(body.answer).toBeDefined()` ✅
- `expect(body.citation).toMatchObject({ documentName: expect.any(String), page: expect.any(Number) })` ✅
- `expect(body.sources).toHaveLength(1)` ✅

E **nenhum atendente, nenhum cliente, nenhum gerente da NovaTech** saberia que o dado está errado até alguém ligar reclamando de prazo incorreto.

### A pergunta que define se o teste tem valor

Antes de commitar qualquer teste gerado, aplique este filtro mental:

> *"Se o sistema retornar esta resposta para um atendente da NovaTech amanhã, o atendente vai informar o cliente com dados corretos e atualizados?"*

Se a resposta for **"não sei"** porque o teste não verifica o conteúdo — o teste está incompleto.

### Três dimensões que todo teste de integração RAG deve cobrir

```
┌───────────────────────────────────────────────────────────────┐
│  1. ESTRUTURA    — o shape existe e está completo             │
│     statusCode, campos obrigatórios, tipos corretos           │
│                                                               │
│  2. CONTEÚDO     — o que está lá é correto (mustContain)      │
│     prazo vigente, documento real, seção relevante            │
│                                                               │
│  3. AUSÊNCIA     — o que não deveria estar lá (mustNotContain)│
│     prazo obsoleto, dado fabricado, internal exposto          │
└───────────────────────────────────────────────────────────────┘
```

Um teste que só cobre a dimensão 1 protege o contrato técnico.
Um teste que cobre 1 + 2 + 3 protege o negócio.

---

## Contexto do sistema sob teste

O NovaTech RAG Assistant tem três componentes principais. Testes de integração cobrem as fronteiras **entre** eles:

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEIRAS COBERTAS POR TESTES DE INTEGRAÇÃO                   │
│                                                                 │
│  ┌───────────┐     HTTP/msw     ┌─────────────────────────┐    │
│  │  Handler  │ ◄──────────────► │  Azure OpenAI           │    │
│  │  (query)  │                  │  (embeddings + chat)    │    │
│  └─────┬─────┘                  └─────────────────────────┘    │
│        │                                                        │
│        │ HTTP/msw     ┌─────────────────────────┐              │
│        └────────────► │  Azure AI Search        │              │
│                        │  (vector retrieval)     │              │
│                        └─────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

**Nunca chame as APIs reais.** Toda saída HTTP deve ser interceptada por msw.

---

## Template canônico

```typescript
// src/[módulo]/[handler].integration.test.ts

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../tests/msw/server';
import { questions } from '../../tests/fixtures/questions';
import { chunks } from '../../tests/fixtures/chunks';
import { ragResponses } from '../../tests/fixtures/ragResponses';
import { queryFactory } from '../../tests/factories/queryFactory';
// import { [HANDLER] } from './[handler]';  ← substitua pelo módulo real

// ─── MSW LIFECYCLE ──────────────────────────────────────────────
// onUnhandledRequest: 'error' força falha explícita se qualquer
// chamada HTTP não coberta por handler escapar para a rede real.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers()); // previne contaminação entre testes
afterAll(() => server.close());

// ─── SUITE ──────────────────────────────────────────────────────
describe('[UNIT_UNDER_TEST] (integration)', () => {

  describe('when [CENÁRIO_HAPPY_PATH]', () => {
    it('[RESULTADO_OBSERVÁVEL_ESPERADO]', async () => {
      // ARRANGE — configure msw para o cenário feliz
      server.use(
        http.post('[AZURE_OPENAI_EMBEDDINGS_URL]', () =>
          HttpResponse.json(/* fixture de embedding */)
        ),
        http.post('[AZURE_AI_SEARCH_URL]', () =>
          HttpResponse.json({ chunks: chunks.twoRelevant })
        )
      );

      const request = queryFactory({ question: questions.[FIXTURE_KEY] });

      // ACT
      const response = await [HANDLER](request);
      const body = JSON.parse(response.body);

      // ASSERT — mustContain: o que a regra de negócio EXIGE
      expect(response.statusCode).toBe(200);
      expect(body.answer).toMatch(/[KEYWORD_OBRIGATÓRIO]/i);
      expect(body.sources).toHaveLength([N_ESPERADO]);
      expect(body.sources[0]).toEqual(
        expect.objectContaining({ chunkId: chunks.[CHUNK_FIXTURE].id })
      );

      // ASSERT — mustNotContain: o que NUNCA pode aparecer
      expect(body.answer).not.toMatch(/error|exception|undefined/i);
      expect(body.answer).not.toMatch(/openai|embedding|vector|chunkId/i);
    });
  });

  describe('when [CENÁRIO_ERRO_OU_EDGE_CASE]', () => {
    it('[RESULTADO_OBSERVÁVEL_ESPERADO]', async () => {
      // ARRANGE — sobrescreva o handler padrão para simular falha
      server.use(
        http.post('[URL_DO_SERVIÇO_FALHANDO]', () =>
          HttpResponse.error() // simula falha de rede
        )
      );

      const request = queryFactory({ question: questions.[FIXTURE_KEY] });

      // ACT
      const response = await [HANDLER](request);
      const body = JSON.parse(response.body);

      // ASSERT — mustContain: resposta de erro deve comunicar limitação
      expect(response.statusCode).toBe([CÓDIGO_ESPERADO]); // ex: 503, 400
      expect(body.error).toBe('[CÓDIGO_DE_ERRO_CANÔNICO]');

      // ASSERT — mustNotContain: erro NUNCA deve vazar internals
      expect(body.error).not.toMatch(/openai|fetch|ECONNREFUSED|stack/i);
      expect(body).not.toHaveProperty('stackTrace');
    });
  });

});
```

---

## Exemplo 1 — ✅ DO: Teste bem escrito

**Cenário coberto:** TC-INT-007 do plano de testes — "Pipeline retorna resposta fundamentada com citação quando chunks relevantes são encontrados"

```typescript
// src/query/queryHandler.integration.test.ts

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../tests/msw/server';
import { questions } from '../../tests/fixtures/questions';
import { chunks } from '../../tests/fixtures/chunks';
import { queryFactory } from '../../tests/factories/queryFactory';
import { queryHandler } from './queryHandler';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('QueryHandler (integration)', () => {

  describe('when a valid question matches high-relevance chunks in the knowledge base', () => {
    it('returns HTTP 200 with a grounded answer, source citation, and no internal fields exposed', async () => {
      // ARRANGE
      // Intercepta a chamada de embedding — retorna vetor válido sem chamar Azure
      server.use(
        http.post('https://novatech.openai.azure.com/openai/deployments/text-embedding-3-small/embeddings', () =>
          HttpResponse.json({
            data: [{ embedding: Array(1536).fill(0.1), index: 0 }],
            model: 'text-embedding-3-small',
          })
        ),
        // Intercepta a busca vetorial — retorna os chunks de fixture, sem chamar Azure AI Search
        http.post('https://novatech.search.windows.net/indexes/novatech-docs/docs/search', () =>
          HttpResponse.json({
            value: [chunks.highRelevance, chunks.mediumRelevance],
          })
        )
      );

      const request = queryFactory({ question: questions.deliveryTime });

      // ACT
      const response = await queryHandler(request);
      const body = JSON.parse(response.body);

      // ASSERT — mustContain: requisito funcional RF-003 (resposta deve citar prazo)
      expect(response.statusCode).toBe(200);
      expect(body.answer).toMatch(/3\s*to\s*5\s*business days/i);
      // A citação deve referenciar o documento de origem com todos os campos obrigatórios
      expect(body.citation).toMatchObject({
        documentName: expect.any(String),
        page: expect.any(Number),
        url: expect.stringMatching(/^https?:\/\//),
        sections: expect.arrayContaining([expect.any(String)]),
      });
      // Fontes devem incluir o chunk de alta relevância
      expect(body.sources).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ chunkId: chunks.highRelevance.id }),
        ])
      );

      // ASSERT — mustNotContain: dados obsoletos, internals e alucinações
      expect(body.answer).not.toMatch(/7\s*to\s*10\s*business days/i); // política desatualizada
      expect(body.answer).not.toMatch(/chunk-|chunkId:|score:/i);       // campos internos
      expect(body.answer).not.toMatch(/error|exception|undefined|null/i);
      expect(body).not.toHaveProperty('stackTrace');
    });
  });

  describe('when the question is outside the knowledge base scope', () => {
    it('returns a scoped fallback message with groundingConfidence none and no fabricated answer', async () => {
      // ARRANGE — retriever retorna lista vazia (pergunta fora do escopo)
      server.use(
        http.post('https://novatech.openai.azure.com/openai/deployments/text-embedding-3-small/embeddings', () =>
          HttpResponse.json({ data: [{ embedding: Array(1536).fill(0.0), index: 0 }] })
        ),
        http.post('https://novatech.search.windows.net/indexes/novatech-docs/docs/search', () =>
          HttpResponse.json({ value: [] }) // sem chunks relevantes
        )
      );

      const request = queryFactory({ question: questions.outOfScope });

      // ACT
      const response = await queryHandler(request);
      const body = JSON.parse(response.body);

      // ASSERT — mustContain: deve comunicar limitação claramente
      expect(response.statusCode).toBe(200);
      expect(body.groundingConfidence).toBe('none');
      expect(body.answer).toMatch(/don't have.*information|not able to answer/i);
      expect(body.sources).toHaveLength(0);

      // ASSERT — mustNotContain: LLM não pode alucinar resposta sobre pergunta fora do escopo
      expect(body.answer).not.toMatch(/Paris|capital|France/i);          // resposta alucinada
      expect(body.answer).not.toMatch(/openai|azure|vector|embedding/i); // internals
      expect(body.citation).toBeUndefined(); // sem citação quando não há grounding
    });
  });

  describe('when the embedding API is unavailable', () => {
    it('returns HTTP 503 with upstream_unavailable error code and no internal details leaked', async () => {
      // ARRANGE — simula falha de rede no serviço de embedding
      server.use(
        http.post('https://novatech.openai.azure.com/openai/deployments/text-embedding-3-small/embeddings', () =>
          HttpResponse.error()
        )
      );

      const request = queryFactory({ question: questions.trackingDelay });

      // ACT
      const response = await queryHandler(request);
      const body = JSON.parse(response.body);

      // ASSERT — mustContain: código canônico de erro de serviço upstream
      expect(response.statusCode).toBe(503);
      expect(body.error).toBe('upstream_unavailable');

      // ASSERT — mustNotContain: detalhes internos não podem vazar para o cliente
      expect(body.error).not.toMatch(/openai|azure|fetch|ECONNREFUSED/i);
      expect(body).not.toHaveProperty('stackTrace');
      expect(body).not.toHaveProperty('cause');
    });
  });

});
```

**Por que este teste é bom — dimensões de estrutura, conteúdo e ausência:**

**Estrutura:** `statusCode`, `citation` com todos os 4 campos, `sources` com shape completo — o contrato técnico está protegido.

**Conteúdo (mustContain):** `toMatch(/3\s*to\s*5\s*business days/i)` verifica a **regra de negócio vigente** da NovaTech, não apenas que a resposta existe. Se o pipeline usar um chunk desatualizado, este teste falha.

**Ausência (mustNotContain):** `not.toMatch(/7\s*to\s*10\s*business days/i)` rejeita explicitamente a **política desatualizada** que existia em versões anteriores de `shipping-policy`. Sem esta linha, o sistema poderia informar o atendente com dado errado e o teste passaria verde.

**Domínio:** todas as perguntas vêm de `questions.ts`, todos os chunks vêm de `chunks.ts` com `source: 'shipping-policy-2024.pdf'` — documentos reais da base da NovaTech. Zero dado inventado.

---

## Exemplo 2 — ❌ DON'T: Teste com problemas comuns gerados por IA

```typescript
// ⚠️ Este arquivo representa o que um agente de IA gera sem contexto adequado.
// Cada linha marcada com ❌ é um problema real — não copie este padrão.

import { describe, test, expect } from 'vitest';
import { queryHandler } from './queryHandler';

// ❌ PROBLEMA 1: Sem lifecycle do msw
// Resultado: o teste pode estar chamando a API real sem saber.
// O msw nunca é inicializado, então qualquer HTTP escapa para produção.

describe('queryHandler', () => {

  // ❌ PROBLEMA 2: Nome sem cenário nem resultado esperado
  // "works" não diz o que é testado, sob qual condição, nem o que deve acontecer.
  // Quando falhar no CI, a mensagem é inútil.
  test('query endpoint works', async () => {

    // ❌ PROBLEMA 3: Dado inline inventado, sem fixture ou factory
    // O agente inventou '{"question": "test"}' porque não leu questions.ts.
    // "test" não é uma pergunta real do domínio — não exercita o pipeline de forma significativa.
    const result = await handler({ body: '{"question": "test"}' });

    // ❌ PROBLEMA 4: Assertion semanticamente vazia
    // toBeDefined() passa se result === true, se result === "", se result === 0.
    // Não verifica shape, statusCode, answer, sources, citation — nada.
    // Um sistema completamente quebrado passaria este teste.
    expect(result).toBeDefined();
  });

  // ❌ PROBLEMA 5: Teste que verifica apenas a estrutura superficial, sem mustNotContain
  test('returns answer with citation', async () => {
    const result = await handler({ body: '{"question": "delivery time"}' });
    const body = JSON.parse(result.body);

    // ❌ Verifica existência, não valor. Se citation for null, toBeTruthy() falha —
    // mas se citation for um objeto vazio {}, passa. O contrato não está protegido.
    expect(body.citation).toBeTruthy();

    // ❌ Nunca verifica o que a resposta NÃO deve conter.
    // Se o LLM alucinar, expor internals, ou retornar política desatualizada,
    // este teste continuará verde. O usuário final recebe a resposta errada.
    expect(body.answer.length).toBeGreaterThan(0);
  });

  // ❌ PROBLEMA 6: Sleep arbitrário
  // Indica que o agente não entendeu o fluxo assíncrono.
  // Torna o teste lento, não-determinístico e mascara problemas de timing real.
  test('handles async correctly', async () => {
    await new Promise(r => setTimeout(r, 2000)); // ← nunca faça isso
    const result = await handler({ body: '{"question": "test"}' });
    expect(result).toBeDefined();
  });

  // ❌ PROBLEMA 7: vi.mock no módulo HTTP em vez de msw
  // Mocka a implementação interna de fetch/axios, não a fronteira HTTP.
  // Não testa que o contrato do endpoint externo está sendo respeitado.
});
```

**Resumo dos problemas:**

| Linha | Anti-pattern | Impacto no negócio |
|---|---|---|
| `test('query endpoint works')` | Nome sem cenário/resultado | CI ilegível, falhas sem diagnóstico |
| `{ body: '{"question": "test"}' }` | Pergunta inventada sem fixture | Não exercita nenhuma regra de negócio real da NovaTech |
| `expect(result).toBeDefined()` | Assertion de existência | Sistema retorna dado errado, atendente informa cliente incorretamente, teste passa |
| `expect(body.citation).toBeTruthy()` | Shape incompleto | Documento obsoleto na citação, sem verificação de validade |
| Sem `mustNotContain` | Ausência de validação negativa | Prazo desatualizado, alucinação do LLM e leakage de internals passam invisíveis |
| `setTimeout(r, 2000)` | Sleep arbitrário | Flaky, lento, mascara causa real |
| Sem `server.listen()` | msw não inicializado | Chamadas reais escapam para produção silenciosamente |

---

## Anti-patterns específicos de testes gerados por IA

Os itens abaixo emergem sistematicamente quando um agente gera testes sem ter lido as fixtures, o contexto de domínio e os padrões do projeto. Revise ativamente cada um ao inspecionar código gerado.

### 1. Assertion de existência disfarçada de assertion de valor

```typescript
// ❌ IA gera porque "parece" mais específico que toBeDefined(), mas é igualmente fraco
expect(body.answer).not.toBeNull();
expect(body.sources.length).toBeGreaterThan(0);
expect(response.statusCode).toBeTruthy(); // passa para 404, 500, qualquer não-zero

// ✅ Asserir o valor concreto que a regra de negócio define
expect(response.statusCode).toBe(200);
expect(body.sources).toHaveLength(2);
expect(body.answer).toMatch(/3 to 5 business days/i);
```

### 2. Validação do shape sem validar os campos internos obrigatórios

```typescript
// ❌ IA gera: valida que citation existe, mas não que os campos obrigatórios estão presentes
expect(body.citation).toBeDefined();
expect(body).toHaveProperty('citation');

// ✅ Validar o contrato completo da citação (requisito de negócio explícito)
expect(body.citation).toMatchObject({
  documentName: expect.any(String),
  page: expect.any(Number),
  url: expect.stringMatching(/^https?:\/\//),
  sections: expect.arrayContaining([expect.any(String)]),
});
```

### 3. Ausência sistemática de mustNotContain — o anti-pattern mais crítico para RAG

A IA nunca gera validações negativas por conta própria porque otimiza para testes que passam, não para testes que falham quando o sistema quebra. Para o domínio da NovaTech, isso é especialmente perigoso: um atendente informado com prazo desatualizado causa reclamação de cliente, e o teste teria passado verde.

```typescript
// ❌ O que IA gera: só o lado positivo
expect(body.answer).toMatch(/delivery/i);

// ✅ O que o teste precisa: positivo + negativo ancorados nas regras da NovaTech
expect(body.answer).toMatch(/3 to 5 business days/i);              // SLA vigente (shipping-policy-2024)
expect(body.answer).not.toMatch(/7 to 10 business days/i);         // SLA de versão anterior — obsoleto
expect(body.answer).not.toMatch(/chunk-|chunkId|score:/i);         // campos internos do pipeline
expect(body.answer).not.toMatch(/error|undefined|null/i);          // leakage de erro
expect(body.citation.documentName).not.toMatch(/2021|2022|2023/);  // documentos obsoletos da base
```

### 4. Criação de dados inline sem factory ou fixture — e sem raiz no domínio

```typescript
// ❌ IA inventa dados genéricos sem nenhuma relação com o domínio da NovaTech
const chunk = {
  id: 'test-chunk',
  content: 'some content',
  score: 0.5,
  metadata: { source: 'test.pdf' }  // ← 'test.pdf' não existe na base documental
};

// ✅ Usar factory com override parcial — base de dados reais da NovaTech
const chunk = chunkFactory({ score: 0.1 });
// chunkFactory usa 'shipping-policy-2024.pdf' como source default — documento real

// ✅ Ou sobrescrever apenas o que importa para o cenário, mantendo o source real
const chunkFromComplianceDoc = chunkFactory({
  score: 0.88,
  metadata: { source: 'compliance-manual-v3.pdf', page: 14, section: 'Cargo Security' }
});
```

### 5. Mockar vi.mock no módulo em vez de msw no handler HTTP

```typescript
// ❌ Mocka a implementação interna — não testa o contrato da fronteira HTTP
vi.mock('../../services/azureOpenAI', () => ({
  createEmbedding: vi.fn().mockResolvedValue([0.1, 0.2])
}));

// ✅ Intercepta a chamada HTTP — testa o contrato real da fronteira
server.use(
  http.post('https://novatech.openai.azure.com/.../embeddings', () =>
    HttpResponse.json({ data: [{ embedding: Array(1536).fill(0.1) }] })
  )
);
```

**A diferença importa:** `vi.mock` testa que *seu código* faz uma chamada. `msw` testa que *a fronteira HTTP* se comporta como esperado — incluindo serialização, headers, códigos de status e tratamento de erros de rede. Em um sistema RAG, a fronteira é onde os bugs de produção ocorrem.

### 6. Assertir texto gerado pelo LLM de forma literal

```typescript
// ❌ Output de LLM é não-determinístico — este teste é flaky por design
expect(body.answer).toBe('Standard shipping to major Brazilian capitals takes 3 to 5 business days after dispatch.');

// ✅ Validar presença de termos-chave com regex case-insensitive
expect(body.answer).toMatch(/3\s*to\s*5\s*business days/i);
expect(body.answer).toMatch(/standard shipping/i);
```

### 7. Omitir o afterEach de reset do msw

```typescript
// ❌ Handlers overrides de um teste contaminam os próximos
beforeAll(() => server.listen());
afterAll(() => server.close());
// sem afterEach — handler de erro do test A afeta o test B

// ✅ Reset obrigatório entre testes
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers()); // ← crítico
afterAll(() => server.close());
```

---

## Referências cruzadas

- Anti-patterns completos: `AGENTS.md > Testing Standards > Seção 8`
- Validação mustContain/mustNotContain: `AGENTS.md > Testing Standards > Seção 5`
- Setup msw: `AGENTS.md > Testing Standards > Seção 6`
- Factories e fixtures: `AGENTS.md > Testing Standards > Seções 6-7`
- TCs elegíveis para automação: `plano-testes-novatech.html` (coluna "Execução" = Automatizado ou Híbrido)
- Exemplo de reescrita de teste ruim: `docs/Reescrevendo_o_teste_ruim.md`
