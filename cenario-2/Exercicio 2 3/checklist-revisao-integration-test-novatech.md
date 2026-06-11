# Checklist de Revisão — Testes de Integração NovaTech RAG

> **Projeto:** `db1/novatech-assistant`
> **Padrão de referência:** `SKILL-create-integration-test.md`
> **Meta:** revisão completa de 1 arquivo de teste em < 2 minutos
> **Revisores:** agente IA ou analista humano — ambos devem chegar à mesma conclusão

---

## Como usar

1. Abra o arquivo `.integration.test.ts` sendo revisado.
2. Para cada item, responda **SIM** (passa) ou **NÃO** (falha).
3. Qualquer item **BLOQUEANTE** com resposta **NÃO** → **REPROVADO**, não segue para merge.
4. Itens **ALERTA** com **NÃO** → registrar comentário no PR, mas não bloquear.
5. Preencher o veredicto final ao fim.

---

## BLOCO 1 — Setup do MSW (~20 s)
> Leia somente o topo do arquivo (imports + lifecycle hooks).

| # | Severidade | Verificação | SIM | NÃO |
|---|---|---|---|---|
| 1.1 | 🔴 BLOQUEANTE | `server.listen({ onUnhandledRequest: 'error' })` está em `beforeAll` | ☐ | ☐ |
| 1.2 | 🔴 BLOQUEANTE | `server.resetHandlers()` está em `afterEach` | ☐ | ☐ |
| 1.3 | 🔴 BLOQUEANTE | `server.close()` está em `afterAll` | ☐ | ☐ |
| 1.4 | 🔴 BLOQUEANTE | Nenhum `vi.mock` é usado para interceptar chamadas HTTP (ex: `azureOpenAI`, `fetch`) | ☐ | ☐ |

**Critério de reprovação imediata:** qualquer NÃO neste bloco — o teste pode estar chamando APIs reais em produção.

---

## BLOCO 2 — Imports e Dados de Entrada (~20 s)
> Leia os imports e todos os lugares onde `request` / `query` / `chunk` são criados.

| # | Severidade | Verificação | SIM | NÃO |
|---|---|---|---|---|
| 2.1 | 🔴 BLOQUEANTE | Perguntas vêm de `questions` (fixture) — nenhuma string inline como `"test"`, `"hello"`, `"what is delivery?"` | ☐ | ☐ |
| 2.2 | 🔴 BLOQUEANTE | Chunks vêm de `chunks` (fixture) ou de `chunkFactory` — nenhum objeto `DocumentChunk` criado inline | ☐ | ☐ |
| 2.3 | 🔴 BLOQUEANTE | Nenhum `source` com valor inválido: `'test.pdf'`, `'document.pdf'`, `'sample-doc.pdf'`, `'mock-data.pdf'` | ☐ | ☐ |
| 2.4 | 🟡 ALERTA | `queryFactory` é usado para construir o request (em vez de objeto literal) | ☐ | ☐ |

---

## BLOCO 3 — Nomenclatura e Estrutura AAA (~15 s)
> Leia os nomes de `describe` e `it`/`test`, e a separação interna dos casos.

| # | Severidade | Verificação | SIM | NÃO |
|---|---|---|---|---|
| 3.1 | 🟡 ALERTA | Describe externo identifica o módulo sob teste: ex. `'QueryHandler (integration)'` | ☐ | ☐ |
| 3.2 | 🔴 BLOQUEANTE | Describe interno descreve um cenário concreto: ex. `'when the embedding API is unavailable'` — não `'test 1'` ou `'works'` | ☐ | ☐ |
| 3.3 | 🔴 BLOQUEANTE | Nome do `it` descreve o resultado observável esperado — não `'works'`, `'is ok'`, `'handles correctly'` | ☐ | ☐ |
| 3.4 | 🟡 ALERTA | Seções ARRANGE / ACT / ASSERT são identificáveis visualmente (comentários ou espaçamento) | ☐ | ☐ |
| 3.5 | 🔴 BLOQUEANTE | Não há `setTimeout` / `sleep` arbitrário em nenhum `it` | ☐ | ☐ |

---

## BLOCO 4 — Dimensão 1: Estrutura (mustHave) (~15 s)
> Leia as assertions de cada `it`.

| # | Severidade | Verificação | SIM | NÃO |
|---|---|---|---|---|
| 4.1 | 🔴 BLOQUEANTE | `statusCode` é assertido com valor exato: `toBe(200)`, `toBe(503)`, `toBe(400)` — não `toBeTruthy()` | ☐ | ☐ |
| 4.2 | 🔴 BLOQUEANTE | `citation` (quando presente) é assertido com `toMatchObject` cobrindo os 4 campos: `documentName`, `page`, `url`, `sections` | ☐ | ☐ |
| 4.3 | 🟡 ALERTA | `sources` é assertido com quantidade exata (`toHaveLength(N)`) ou conteúdo específico (`arrayContaining`) | ☐ | ☐ |
| 4.4 | 🔴 BLOQUEANTE | Nenhuma assertion usa apenas `toBeDefined()`, `toBeTruthy()`, `not.toBeNull()` como verificação principal de valor de negócio | ☐ | ☐ |

---

## BLOCO 5 — Dimensão 2: Conteúdo (mustContain) (~20 s)
> Verifique se o que **deve estar** na resposta é assertido com precisão de domínio.

| # | Severidade | Verificação | SIM | NÃO |
|---|---|---|---|---|
| 5.1 | 🔴 BLOQUEANTE | Cenários de happy path assertem o **valor concreto de negócio** esperado (ex: `toMatch(/3\s*to\s*5\s*business days/i)`) — não apenas `toMatch(/delivery/i)` | ☐ | ☐ |
| 5.2 | 🔴 BLOQUEANTE | Cenários de fallback assertem `groundingConfidence: 'none'` e `sources` com `toHaveLength(0)` | ☐ | ☐ |
| 5.3 | 🔴 BLOQUEANTE | Cenários de erro assertem o **código canônico** de erro (ex: `toBe('upstream_unavailable')`) — não apenas `toBeDefined()` | ☐ | ☐ |
| 5.4 | 🟡 ALERTA | Assertions de texto de LLM usam regex case-insensitive (`toMatch(/termo/i)`) — não `toBe('frase literal exata')` | ☐ | ☐ |

---

## BLOCO 6 — Dimensão 3: Ausência (mustNotContain) (~20 s)
> Este é o bloco mais crítico para sistemas RAG. Verifique se o que **não deve estar** na resposta é assertido.

| # | Severidade | Verificação | SIM | NÃO |
|---|---|---|---|---|
| 6.1 | 🔴 BLOQUEANTE | `body.answer` tem `not.toMatch` para **política desatualizada** (ex: `not.toMatch(/7\s*to\s*10\s*business days/i)`) | ☐ | ☐ |
| 6.2 | 🔴 BLOQUEANTE | `body.answer` tem `not.toMatch` para **campos internos** do pipeline (ex: `not.toMatch(/chunk-\|chunkId\|score:/i)`) | ☐ | ☐ |
| 6.3 | 🔴 BLOQUEANTE | Cenários de erro têm `not.toMatch` para **internals de serviço** (ex: `not.toMatch(/openai\|azure\|ECONNREFUSED\|fetch/i)`) | ☐ | ☐ |
| 6.4 | 🔴 BLOQUEANTE | Cenários de erro assertem `not.toHaveProperty('stackTrace')` | ☐ | ☐ |
| 6.5 | 🟡 ALERTA | `citation.documentName` tem `not.toMatch` para anos de documentos obsoletos (ex: `not.toMatch(/2021\|2022\|2023/)`) | ☐ | ☐ |

---

## BLOCO 7 — Rastreabilidade (~10 s)
> Leia o comentário no topo de cada `describe` ou `it`.

| # | Severidade | Verificação | SIM | NÃO |
|---|---|---|---|---|
| 7.1 | 🟡 ALERTA | Pelo menos um `it` referencia o TC-ID do plano de testes (ex: `// TC-INT-007`) | ☐ | ☐ |
| 7.2 | 🟡 ALERTA | O TC-ID referenciado existe no `plano-testes-novatech.html` com status `Automatizado` ou `Híbrido` | ☐ | ☐ |

---

## VEREDICTO FINAL

```
Arquivo revisado: ___________________________________
Revisor: ____________________________________________
Data: _______________________________________________

BLOQUEANTES com NÃO: _____ / 16
ALERTAS com NÃO:     _____ / 7

[ ] APROVADO      — 0 bloqueantes reprovados
[ ] REPROVADO     — 1 ou mais bloqueantes reprovados

Itens reprovados (liste os números):
_________________________________________________

Observações:
_________________________________________________
```

---

## Referência rápida — o que diferencia um teste aprovado

| Dimensão | ❌ Reprovado | ✅ Aprovado |
|---|---|---|
| MSW | `vi.mock('azureOpenAI')` ou sem `resetHandlers` | `server.use(http.post(...))` + lifecycle completo |
| Dados | `'{"question": "test"}'` ou `source: 'test.pdf'` | `questions.deliveryTime` + `chunks.highRelevance` |
| Naming | `test('works')` | `it('returns HTTP 503 with canonical error and no internal details leaked')` |
| mustContain | `expect(body.answer).toBeDefined()` | `expect(body.answer).toMatch(/3\s*to\s*5\s*business days/i)` |
| mustNotContain | ausente | `expect(body.answer).not.toMatch(/7\s*to\s*10\s*business days/i)` |
| Erro | `expect(body.error).toBeDefined()` | `expect(body.error).toBe('upstream_unavailable')` + `not.toHaveProperty('stackTrace')` |
