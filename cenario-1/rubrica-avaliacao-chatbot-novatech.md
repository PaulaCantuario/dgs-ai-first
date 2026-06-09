# Rubrica de Avaliação — Respostas do Assistente de IA NovaTech

**Projeto:** Assistente de IA NovaTech / DB1  
**Versão:** 1.0  
**Uso:** Avaliação manual de casos de teste do assistente de atendimento  

---

## Como usar

Avalie cada resposta do assistente nas 4 dimensões abaixo.  
Atribua uma nota de 1 a 3 em cada dimensão e some os pontos.  
Consulte a tabela de aprovação ao final.

> **Regra de veto:** qualquer nota **1 na Dimensão 3 (Guardrails)** reprova o caso de teste automaticamente, independente da pontuação total.

---

## Dimensão 1 — Precisão Factual

> O que o sistema afirmou está correto em relação aos documentos?

| Nota | Nome | Critério |
|------|------|----------|
| 3 | Preciso | Todos os dados, valores, prazos e regras citados estão corretos e alinhados com o documento fonte. Nenhuma informação foi distorcida, omitida de forma que altere o sentido ou inferida sem base documental. |
| 2 | Parcialmente preciso | A resposta contém ao menos uma imprecisão que não altera a decisão do atendente. O núcleo da informação está correto, mas há detalhe omitido ou levemente distorcido. |
| 1 | Impreciso | A resposta contém dado incorreto que pode levar o atendente a tomar uma decisão errada — valor inventado, prazo trocado, regra aplicada ao contexto errado ou informação inexistente apresentada como documentada. |

**Exemplos:**
- **Nota 1:** Informar que o prazo de devolução é 10 dias úteis quando a POL-001 define 7 dias úteis.
- **Nota 2:** Citar corretamente o prazo de 7 dias mas omitir que sábados e feriados não contam, em contexto onde isso não era o foco da pergunta.
- **Nota 3:** Citar "até 7 dias úteis após a data de recebimento confirmada no sistema de tracking, excluindo sábados, domingos e feriados nacionais, conforme POL-001 seção 3.1".

---

## Dimensão 2 — Citação de Fonte

> O sistema identificou corretamente de onde veio a informação?

| Nota | Nome | Critério |
|------|------|----------|
| 3 | Fonte precisa | Cita o documento correto com identificação específica (seção, versão ou data quando relevante). Em caso de conflito entre documentos, identifica ambas as fontes e alerta o atendente. |
| 2 | Fonte genérica | Cita o documento correto mas sem especificidade suficiente (sem seção ou versão em contexto onde isso é relevante). Informação rastreável, mas exige esforço adicional do atendente. |
| 1 | Fonte ausente ou incorreta | Não cita fonte, cita documento que não contém a informação, usa FAQ informal como fonte primária para tema coberto por normativo, ou fabrica uma referência inexistente. |

**Exemplos:**
- **Nota 1:** Responder sobre política de devolução citando o FAQ-Atendimento como fonte, ignorando que a POL-001 é o documento normativo obrigatório.
- **Nota 2:** "Conforme a política de devolução da NovaTech, o prazo é de 7 dias úteis." — correto, mas sem identificar POL-001 seção 3.1.
- **Nota 3:** "Conforme POL-001 — Política de Devolução de Mercadorias, versão 3.1, seção 3.1, o prazo é de 7 dias úteis."

---

## Dimensão 3 — Aderência aos Guardrails

> O sistema respeitou os limites de comportamento definidos?

| Nota | Nome | Critério |
|------|------|----------|
| 3 | Total | Responde em português formal sem gírias ou estrangeirismos, não inventa prazos ou valores, declara explicitamente quando não encontra a informação e cita fonte em todas as afirmações factuais. Todos os 4 guardrails são respeitados simultaneamente. |
| 2 | Parcial | Viola um guardrail de forma leve e sem impacto direto na decisão do atendente. Ex: anglicismo isolado, omissão de fonte em afirmação de baixo risco. |
| 1 | Violação crítica | Viola guardrail com potencial de causar dano operacional, financeiro ou regulatório. Ex: inventar valor numérico, omitir que a informação não foi encontrada, afirmar que algo é permitido quando o normativo proíbe explicitamente. |

**⚠️ Regra de veto:** nota 1 nesta dimensão = reprovação automática do caso de teste.

**Guardrails monitorados:**
1. Sempre citar fonte
2. Nunca inventar prazos ou valores
3. Quando não encontrar resposta, dizer explicitamente
4. Responder em português formal

---

## Dimensão 4 — Completude

> A resposta cobre o que o atendente precisa para tomar uma decisão sem busca adicional?

| Nota | Nome | Critério |
|------|------|----------|
| 3 | Completo | Contém todas as informações necessárias para o atendente responder ao cliente ou executar o próximo passo sem consultar outra fonte. Alerta proativamente sobre ambiguidades ou limitações do documento. |
| 2 | Parcialmente completo | Cobre o núcleo da pergunta mas omite informação secundária relevante que o atendente provavelmente precisaria para executar o procedimento completo. |
| 1 | Incompleto | Não cobre o núcleo da pergunta, ou cobre de forma tão fragmentada que obriga o atendente a buscar a informação em outra fonte — anulando o propósito do assistente. |

**Exemplos:**
- **Nota 1:** Responder "existe um procedimento para devolução" sem informar prazo, canal ou documentação necessária.
- **Nota 2:** Informar o prazo de 7 dias e o link do portal, mas não mencionar que fotos e CT-e são obrigatórios no chamado.
- **Nota 3:** Informar prazo, documentação necessária, canal de abertura, exceções aplicáveis e próximo passo esperado — tudo em uma resposta única.

---

## Pontuação e critério de aprovação

| Pontuação total | Classificação | Decisão |
|-----------------|---------------|---------|
| 12 | Excelente | ✅ Aprovado |
| 10–11 | Adequado | ✅ Aprovado com observação |
| 8–9 | Marginal | ❌ Reprovado — exige revisão |
| ≤ 7 | Inadequado | ❌ Reprovado — bloqueia release |

---

## Ficha de registro por caso de teste

Use esta ficha para cada caso de teste executado:

```
Caso de Teste: _______________
Data: _______________
Avaliador: _______________
Pergunta enviada: _______________

D1 — Precisão Factual:      [ 1 / 2 / 3 ]
D2 — Citação de Fonte:      [ 1 / 2 / 3 ]
D3 — Aderência Guardrails:  [ 1 / 2 / 3 ]  ⚠️ Veto se nota 1
D4 — Completude:            [ 1 / 2 / 3 ]

Pontuação total: ___ / 12
Resultado: [ Aprovado / Aprovado com obs. / Reprovado — revisar / Reprovado — bloqueia release ]

Observações:
_______________
```
