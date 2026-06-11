# Exercício 2.2 — Criação de spec de testes no formato SDD

### **Contexto:** No modelo SDD, até o plano de testes deve ser especificado antes de ser implementado. Você precisa escrever a spec de testes para o query endpoint.

**Ferramentas a utilizar:** Claude (chat) + Claude Cowork

**Inputs fornecidos:**

- O cenário completo.
- A documentação da NovaTech (ver **Anexo A**) e os chunks de referência (ver **Anexo B**) — use para criar dados de teste realistas.
- Os [requirements.md](http://requirements.md/) do query endpoint (simulado):
    
    ```
    Outcomes:
    - Atendente recebe resposta relevante em < 30s
    - Toda resposta cita ao menos uma fonte
    - Quando confiança é baixa, resposta inclui aviso
    - Cargas perigosas nunca recebem informação de devolução
    
    Verification Criteria:
    - VC-01: Resposta em < 30s para 95% das queries
    - VC-02: 100% das respostas incluem campo source_document
    - VC-03: Queries sobre carga perigosa + devolução retornam negativa explícita
    - VC-04: Queries sem match retornam mensagem padrão de "não encontrado"
    ```
    

**Tarefa:**

1. Usando o **Claude**, escreva um `test-plan.md` que derive dos verification criteria. Para cada VC: cenários de teste (happy path + edge cases), dados de teste (perguntas + chunks esperados), e critério de aprovação.
    
    [test-plan.md](test-plan.md)
    
2. Inclua testes de robustez da IA: perguntas ambíguas, prompt injection básico, perguntas em idiomas diferentes.
    
    [test-plan-robustez.md](test-plan-robustez.md)
    
3. Usando o **Claude Cowork**, organize num formato rastreável: ID único por cenário, status, link para VC.
    
    [plano-testes-novatech.html](plano-testes-novatech.html)
    
    [plano-testes-novatech.xlsx](plano-testes-novatech.xlsx)
    

**Entregável:** O [test-plan.md](http://test-plan.md/), os cenários de robustez, e o artefato organizado pelo Cowork.

**Critérios de avaliação:**

- Cada VC tem ao menos 2 cenários (happy path + edge case).
- Os dados de teste são realistas e do domínio de logística (não são "test" e "hello").
- Os testes de robustez demonstram compreensão de riscos de IA (prompt injection, language confusion).
- O artefato do Cowork é rastreável (teste → VC).