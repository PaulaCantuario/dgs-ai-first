# Critérios de Review para Testes Gerados por IA

Antes de fazer merge de qualquer teste gerado por IA, o revisor **deve** verificar todos os itens abaixo.
Use como base a sessão "Testing Standarts" do arquivo "AGENTS.md" para revisão de código.
Veja a próxima sessão para os critérios completos de aprovação.

- [ ] O nome do teste descreve comportamento, condição e resultado esperado (AGENTS.md - Testing Standarts - Seção 1)
- [ ] A estrutura AAA está visível com separação por linha em branco (AGENTS.md - Testing Standarts - Seção 2)
- [ ] Nenhuma assertion é apenas `toBeDefined()` ou `toBeTruthy()` (AGENTS.md - Testing Standarts - Seção 3)
- [ ] Todas as chamadas HTTP passam pelo MSW — nenhuma chamada real de rede (AGENTS.md - Testing Standarts - Seção 4)
- [ ] Dados são construídos via factories, não objetos literais inline AGENTS.md - Testing Standarts - (Seção 4)
- [ ] Testes RAG usam fixtures para triplas de pergunta/resposta/citação (AGENTS.md - Testing Standarts - Seção 5)
- [ ] O teste é isolado — não depende de ordem ou estado mutável compartilhado (AGENTS.md - Testing Standarts - Seção 2)
- [ ] O teste **falharia** se a implementação tivesse um bug conhecido (pergunte: qual bug esse teste pega?)

---

# Critérios de Aprovação de Testes Gerados por IA no Code Review

> Esses critérios são objetivos: dois revisores analisando o mesmo teste devem chegar à mesma conclusão.

### Critério 1 — O teste falha pelo motivo certo

**Definição:** Se a implementação contém o bug específico que esse teste deveria capturar,
o teste **deve** falhar. Se você consegue introduzir uma regressão conhecida e o teste ainda passa,
ele não tem valor algum.

**Como verificar no review:**
Mentalmente (ou literalmente) altere a implementação para um comportamento errado plausível e pergunte:
"Esse teste pega isso?"

```typescript
// Test claims to verify citation source — but does it?
it('should include the correct citation', async () => {
  const result = await queryDocumentHandler(input)
  expect(result.citation).toBeDefined() // ← FAILS this criterion
  // A handler that returns citation: {} would still pass this test.
  // The bug (wrong source) would NOT be caught.
})

// Revised — this one actually catches the bug
it('should include the correct citation source and version', async () => {
  const result = await queryDocumentHandler(input)
  expect(result.citation.source).toBe('sla-policy-2024-q4.pdf') // ← catches wrong document
  expect(result.citation.version).toBe('v3.2')                  // ← catches stale version
})
```

**Rejeição automática:** Qualquer teste cuja única assertion seja `toBeDefined()`, `toBeTruthy()`,
`not.toBeNull()`, `toHaveBeenCalled()` (sem argument matchers) ou `expect.anything()`.

---

### Critério 2 — O teste é isolado e não tem dependências ocultas

**Definição:** O teste **deve** produzir o mesmo resultado em qualquer ordem de execução, em qualquer
ambiente (local, CI, staging), sem acesso à rede, e independentemente de outros testes.

**Como verificar no review:**

1. Toda chamada HTTP externa passa pelo MSW? (Verifique se há chamadas `fetch`, `axios` ou SDK não interceptadas.)
2. O teste modifica alguma variável de módulo ou singleton sem restaurá-la no `afterEach`?
3. O sucesso do teste depende de dados criados por um teste anterior?
4. O teste usa variáveis de `process.env` que só existem em ambientes específicos?

```typescript
// ❌ Fails isolation criterion — depends on real Azure endpoint
it('should return SLA information', async () => {
  // No MSW mock → this hits the real Azure AI Search service
  const result = await queryDocumentHandler(buildQueryRequest())
  expect(result.answer).toContain('4 horas')
  // Passes locally (dev has Azure access), fails in CI (no credentials)
})

// ✅ Passes isolation criterion — fully controlled environment
it('should return SLA information from the correct document', async () => {
  server.use(mockAzureSearchResponse([buildDocumentChunk(SLA_CHUNK_OVERRIDES)]))
  const result = await queryDocumentHandler(buildQueryRequest())
  expect(result.answer).toContain('4 horas úteis')
})
```

**Rejeição automática:** Qualquer teste que faça requests HTTP não interceptados pelo MSW.
O `onUnhandledRequest: 'error'` vai pegar isso no CI, mas o revisor não deve esperar o CI
ser o primeiro ponto de verificação.

---

### Critério 3 — O nome do teste e o corpo do teste são consistentes

**Definição:** O nome do teste é uma promessa. O corpo do teste deve cumprir exatamente essa promessa —
nem mais, nem menos. Uma divergência entre nome e corpo é uma mentira na documentação.

**Como verificar no review:**

Leia a descrição do `it()`. Depois leia as assertions. Pergunte:
- Cada assertion corresponde diretamente ao que o nome afirma?
- Há assertions que testam algo que o nome não menciona? (Escopo extrapolado — divida o teste)
- O nome promete algo que as assertions não verificam? (Teste incompleto — adicione assertions)

```typescript
// ❌ Fails criterion 3 — name says "citation" but body also checks answer content
// AND doesn't actually verify the citation version
it('should return the correct citation for SLA queries', async () => {
  const result = await queryDocumentHandler(buildQueryRequest())
  expect(result.answer).toContain('4 horas')          // ← not about citation
  expect(result.citation.source).toBeDefined()         // ← vague, doesn't verify correctness
  expect(result.status).toBe(200)                     // ← not about citation
})

// ✅ Passes criterion 3 — name and body are aligned and complete
it('should attach citation with source document and version when answer is found', async () => {
  server.use(mockAzureSearchResponse([buildDocumentChunk({ source: 'sla-policy-2024-q4.pdf' })]))
  const result = await queryDocumentHandler(buildQueryRequest())

  // These three assertions are EXACTLY what the name promises — nothing else
  expect(result.citation.source).toBe('sla-policy-2024-q4.pdf')
  expect(result.citation.version).toBe('v3.2')
  expect(result.citation.documentTitle).toBe('SLA Policy 2024 Q4')
})
```

**Rejeição automática:** Qualquer teste cujo nome contenha as palavras "works", "is correct",
"handles it", "test", ou que seja um `it('query endpoint')` genérico sem descrição de comportamento.
