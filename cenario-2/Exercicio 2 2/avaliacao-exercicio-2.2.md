# Avaliação do Exercício 2.2
**Trilha de Certificação AI First — DGS / DB1 Global Software**
**Papel:** QA | **Cenário:** 2 — Estruturação do Trabalho | **Exercício:** 2.2 — Criação de spec de testes no formato SDD

---

## Resumo

Entregável de qualidade excepcionalmente alta para o nível da certificação. O participante produziu um plano de testes que vai muito além do que o enunciado pedia: derivou os VCs corretamente, construiu dados de teste a partir dos documentos reais do domínio (com contradições específicas entre PROC-042 v1 e v2), e demonstrou pensamento de QA sênior ao explicitar decisões abertas que bloqueiam a execução antes de testar. Os testes de robustez são tecnicamente sofisticados e revelam compreensão real de como sistemas RAG falham. A iteração via Claude é documentada, concreta e com mudanças substanciais entre versões.

---

## Scores por Dimensão

| Dimensão | Score | Justificativa |
|----------|-------|---------------|
| D1 — Domínio Conceitual | 3 | Demonstra compreensão precisa de SDD: plano deriva dos VCs, não o contrário. Entende a distinção entre critérios verificáveis mecanicamente vs semanticamente — e explica o motivo, não apenas aplica. Compreende o risco específico de VC-03 com referência à ANTT nº 5.947/2021. Sabe o que é rastreabilidade real (TC → VC com ID único). Não há nenhuma confusão conceitual nos 1.044 + 824 linhas produzidas. |
| D2 — Uso de Ferramentas | 3 | A conversa documenta 4 rodadas de iteração com Claude: (1) geração inicial da v1, (2) atualização com os anexos A/B produzindo v2, (3) decisão de automação como novo ciclo, (4) geração da v3 final integrando automação. Cada rodada tem raciocínio explícito antes de gerar. O Claude Cowork foi usado para produzir os artefatos rastreáveis (.html e .xlsx). Não é prompt único — é processo iterativo com refinamento documentado e diferenças concretas entre versões. |
| D3 — Qualidade do Entregável | 3 | `test-plan.md` v3.0: 22 TCs com ID único, mapeamento para VC, campo `Execução` em cada TC, matriz de rastreabilidade completa, 12 seções estruturadas. `test-plan-robustez.md`: 24 TCs adicionais com eixo, VC relacionado, flag de bloqueador. Artefatos `.html` e `.xlsx` com IDs rastreáveis entregues pelo Cowork. Nenhum TC usa dados genéricos — todos usam linguagem do domínio: SLA Gold, frete Manaus-Norte, PROC-042v2, classe ANTT, bateria de lítio. |
| D4 — Pensamento Crítico | 3 | Identifica e documenta 7 riscos e decisões abertas que bloqueiam execução antes de iniciar (R1–R7) — nenhum QA júnior faz isso. Reconhece que VC-03 em automação parcial cria **falsa segurança** (R7) e mantém TC-03-001/002 como manuais independentemente de pressão de velocidade. Diferencia "sem match" de "match de negativa" (tier Platinum — a base tem a resposta, e ela é "não existe"). Levanta o gap de bateria de lítio classe 9 fora das classes 1-6 da POL-001. Explicita que threshold de `confidence` é decisão de engenharia, não de QA. |
| D5 — Aplicabilidade ao Projeto | 3 | Profundamente enraizado no NovaTech. Os dados de teste são extraídos dos Anexos A/B: multiplicadores regionais exatos com os deltas entre v1 e v2, 9 contradições documentadas com valores específicos, 100 queries do corpus k6 com proporções calculadas por categoria. Usa linguagem ubíqua do domínio: CT-e, ANTT, frete especial, tier Gold/Silver, ramal 4500. O risco de cross-lingual retrieval no Azure AI Search para terminologia logística brasileira específica (TC-RB03, R1 do plano de robustez) é aplicado ao stack técnico declarado no cenário. |

**Score do exercício: 3.0**

---

## Verificação de Artefatos Machine-Readable

Este exercício não produz AGENTS.md ou skill, então o critério de "prescritivo para agentes" não se aplica diretamente. O que se avalia aqui é rastreabilidade e estrutura consumível.

O `.html` e o `.xlsx` do Cowork entregam IDs únicos vinculados a VCs — o requisito mínimo de rastreabilidade está cumprido.

O `test-plan.md` é bem estruturado: cada TC tem tabela de metadados com campos padronizados (ID, Prioridade, Tipo, Execução), input em JSON formatado, análise, e critério de aprovação separados. Um agente que precisasse parsear os TCs conseguiria extrair os campos mecanicamente. Não há teste sem ID, não há critério de aprovação puramente narrativo.

O `test-plan-robustez.md` mantém o mesmo padrão de estrutura — campos consistentes, matriz de rastreabilidade com colunas tipadas (Eixo, VC relacionado, Bloqueador?, Execução).

---

## Pontos Fortes

**1. Análise da base documental antes dos test cases (Seção 2 do test-plan.md).**
A decisão de mapear contradições e gaps documentais *antes* de escrever qualquer cenário é o que diferencia QA de automação de QA de produto. Os 9 valores conflitantes entre PROC-042 v1 e v2, com os deltas exatos, foram extraídos dos documentos reais — não inventados. Isso significa que quando o sistema falhar no TC-04-006, o QA executor vai saber exatamente o que procurar na resposta.

**2. Separação clara entre critério mecânico e critério semântico, com justificativa por TC.**
A Seção 4.1 do test-plan.md define três categorias de critério e fundamenta *por que* cada TC pertence a cada uma. O "Por que manual" em cada TC manual é a diferença entre um plano que o time segue por convenção e um plano que o time entende. O argumento sobre TC-04-002 ("apresenta com mesma confiança" não é assertiva de campo) é um argumento técnico correto, não uma preferência.

**3. Testes de robustez com vetores específicos ao contexto RAG da NovaTech.**
O RB-02 não é uma lista genérica de prompt injections — é construída com o vetor de risco real: atendente que colou texto de e-mail de cliente com instruções embutidas. O TC-RB02-003 (injeção orientada a VC-03) e os TCs de VC-03 em inglês e espanhol como bloqueadores de release demonstram que o participante entende que "resistência a injeção" precisa cobrir o vetor mais realista, não o mais óbvio.

---

## Pontos de Melhoria

**1. Critério de aprovação do VC-03 poderia incluir o texto mínimo esperado na negativa.**
TC-03-001 e TC-03-002 definem que a resposta deve ser "negativa explícita", mas não definem o que constitui "explícita". Uma resposta que diz "o processo padrão não se aplica a cargas desse tipo" é uma negativa explícita? E uma que diz "consulte o setor especializado"? Antes da execução, vale alinhar com o PO se a negativa precisa citar a POL-001 ou a ANTT — isso tornaria os critérios verificáveis sem depender tanto de julgamento de quem executa.

**2. O corpus de 100 queries do TC-01-003 está listado no plano mas não em arquivo separado executável.**
A conversa menciona "100 queries exatas, agrupadas por domínio" na v2, mas no arquivo final elas aparecem incorporadas no body do TC. Para o k6 funcionar, alguém vai precisar extrair essas queries para um `.json` separado. Vale criar esse artefato como entregável do plano — ou referenciar onde ele será mantido.

**3. Ausência de critério de regressão para mudanças de configuração no `test-plan.md` principal.**
O plano de robustez menciona regressão para mudanças de system prompt, modelo LLM e embedding (Seção 9). Mas o `test-plan.md` funcional não tem esse vínculo — um TC de VC-03 que passa hoje pode falhar silenciosamente depois de um ajuste de temperatura do modelo sem que ninguém saiba quais TCs executar de novo. Um mínimo seria uma tabela na Seção 11 (Riscos) indicando quais TCs entram em regressão por tipo de mudança.

---

## Classificação

**Aprovado com distinção (3.0)**

---

## Tópicos da Trilha para Reforço

Não aplicável — score 3.0. Nenhum tópico precisa ser revisitado com base nos entregáveis produzidos.

Se quiser **avançar** além do que a trilha exige, os próximos temas naturais para este nível de trabalho seriam: definição de harness de avaliação automática para sistemas RAG (como RAGAS ou LLM-as-judge para os critérios semânticos que estão manuais hoje), e estratégia de contract testing para o schema do `/query` com Pact ou equivalente.

---

*Avaliação produzida no contexto da Trilha de Certificação AI First — DGS / DB1 Global Software.*
*Cenário 2 — Estruturação do Trabalho | Exercício 2.2 — QA*
