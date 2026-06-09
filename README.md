# DGS AI First — Trilha de Capacitação

Repositório de materiais da trilha **AI First** da DB1, com exercícios práticos focados no papel de **QA em sistemas de IA**.

---

## Estrutura do projeto

```
dgs-ai-first/
└── cenario-1/          # Cenário 1 — QA de um assistente RAG (NovaTech)
```

---

## Cenário 1 — QA do Assistente de IA NovaTech

O cenário simula um assistente de atendimento baseado em **pipeline RAG** (Retrieval-Augmented Generation) para a empresa fictícia NovaTech. O objetivo é aplicar práticas de QA específicas para sistemas de IA generativa.

### Arquivos

| Arquivo | Descrição |
|---|---|
| [IA First - DB1 ...html](cenario-1/IA%20First%20-%20DB1%20368bc1ca89ad8079b48adf8b207fb710.html) | Página principal da trilha no Notion |
| [Exercício Fase 1 - Entendimento ...html](cenario-1/Exerc%C3%ADcio%20Fase%201%20-%20Entendimento%20374bc1ca89ad80308b14c5af03210768.html) | Leitura de contexto e entendimento do problema |
| [Exercício 1.1 — Identificação de cenários de falha ...html](cenario-1/Exerc%C3%ADcio%201%201%20%E2%80%94%20Identifica%C3%A7%C3%A3o%20de%20cen%C3%A1rios%20de%20falha%20373bc1ca89ad80e9ab7bee0d42d2b3d5.html) | Mapeamento de falhas de IA (alucinação, falhas de contexto, guardrails) |
| [Exercício 1.2 — Design de critérios de aceitação ...html](cenario-1/Exerc%C3%ADcio%201%202%20%E2%80%94%20Design%20de%20crit%C3%A9rios%20de%20aceita%C3%A7%C3%A3o%20p%20374bc1ca89ad80198b38d73f4ee0d6d0.html) | Definição de critérios de aceitação para respostas do assistente |
| [Exercício 1.3 — Plano de testes para pipeline de RAG ...html](cenario-1/Exerc%C3%ADcio%201%203%20%E2%80%94%20Plano%20de%20testes%20para%20pipeline%20de%20R%20374bc1ca89ad8021bb0bce8465efee3d.html) | Elaboração do plano de testes end-to-end do pipeline RAG |
| [Plano de Testes - Lista final Consolidada ...html](cenario-1/Plano%20de%20Testes%20-%20Lista%20final%20Consolidada%20373bc1ca89ad80b79fb6da01462882b6.html) | Lista consolidada de todos os casos de teste |
| [Plano de testes para pipeline RAG ...html](cenario-1/Plano%20de%20testes%20para%20pipeline%20RAG%20374bc1ca89ad8090a523fc2d5e93563e.html) | Plano de testes detalhado do pipeline RAG |
| [Avaliação Manual ...html](cenario-1/Avalia%C3%A7%C3%A3o%20Manual%20373bc1ca89ad80efa2f6ca27860a05e8.html) | Resultado das avaliações manuais executadas |
| [avaliacoes-cenario-1-qa.html](cenario-1/avaliacoes-cenario-1-qa.html) | Consolidação das avaliações do Cenário 1 — Papel QA |
| [rubrica-avaliacao-chatbot-novatech.md](cenario-1/rubrica-avaliacao-chatbot-novatech.md) | **Rubrica de avaliação** — 4 dimensões de qualidade (leia primeiro) |
| [plano-testes-rag-novatech.xlsx](cenario-1/plano-testes-rag-novatech.xlsx) | Planilha do plano de testes |
| [avaliacao-chatbot-novatech.xlsx](cenario-1/avaliacao-chatbot-novatech.xlsx) | Planilha de avaliação dos casos de teste |

### Ordem de leitura recomendada

1. **[Entendimento do problema](cenario-1/Exerc%C3%ADcio%20Fase%201%20-%20Entendimento%20374bc1ca89ad80308b14c5af03210768.html)** — comece aqui para entender o contexto do assistente NovaTech
2. **[Rubrica de avaliação](cenario-1/rubrica-avaliacao-chatbot-novatech.md)** — aprenda as 4 dimensões de qualidade usadas para avaliar respostas
3. **[Exercício 1.1](cenario-1/Exerc%C3%ADcio%201%201%20%E2%80%94%20Identifica%C3%A7%C3%A3o%20de%20cen%C3%A1rios%20de%20falha%20373bc1ca89ad80e9ab7bee0d42d2b3d5.html)** — identifique cenários de falha do sistema de IA
4. **[Exercício 1.2](cenario-1/Exerc%C3%ADcio%201%202%20%E2%80%94%20Design%20de%20crit%C3%A9rios%20de%20aceita%C3%A7%C3%A3o%20p%20374bc1ca89ad80198b38d73f4ee0d6d0.html)** — defina critérios de aceitação para as respostas
5. **[Exercício 1.3](cenario-1/Exerc%C3%ADcio%201%203%20%E2%80%94%20Plano%20de%20testes%20para%20pipeline%20de%20R%20374bc1ca89ad8021bb0bce8465efee3d.html)** — elabore o plano de testes do pipeline RAG
6. **[Lista consolidada de testes](cenario-1/Plano%20de%20Testes%20-%20Lista%20final%20Consolidada%20373bc1ca89ad80b79fb6da01462882b6.html)** — veja o resultado final dos casos de teste
7. **[Avaliações](cenario-1/avaliacoes-cenario-1-qa.html)** — consulte as avaliações e resultados do cenário

### Rubrica de avaliação (resumo)

As respostas do assistente são avaliadas em **4 dimensões**, cada uma pontuada de 1 a 3:

| Dimensão | O que avalia |
|---|---|
| D1 — Precisão Factual | As informações estão corretas e alinhadas com os documentos? |
| D2 — Citação de Fonte | O sistema identificou corretamente a origem da informação? |
| D3 — Aderência aos Guardrails | O sistema respeitou os limites de comportamento definidos? |
| D4 — Completude | A resposta cobre tudo que o atendente precisa para decidir? |

> **Regra de veto:** nota 1 na Dimensão 3 reprova o caso de teste automaticamente.

| Pontuação | Resultado |
|---|---|
| 12 | Aprovado |
| 10–11 | Aprovado com observação |
| 8–9 | Reprovado — exige revisão |
| ≤ 7 | Reprovado — bloqueia release |
