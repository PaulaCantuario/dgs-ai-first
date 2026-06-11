# Exercício 2.3 — Definição de skill de geração de testes

### **Contexto:** Você precisa criar a skill que define como testes devem ser gerados para este projeto.

**Ferramentas a utilizar:** Claude (chat) + Claude Cowork

**Inputs fornecidos:**

- O cenário completo.
- O teste ruim e o teste reescrito do exercício 2.1 (referência de anti-padrão e padrão desejado).
- Testing Standards simulados (output do exercício 2.1 — fornecidos para que este exercício seja autossuficiente):
    
    ```
    Testing Standards (resumo):
    - Nomenclatura: describe('ModuleName', () => { it('should [behavior] when [condition]') })
    - Estrutura: arrange/act/assert explícitos em todo teste.
    - Assertions: específicas ao comportamento, nunca toBeDefined() ou toBeTruthy() sozinhos.
    - Mocking: msw para HTTP externo, factories para dados de teste.
    - Fixtures: /tests/fixtures/ com chunks, queries e expected responses reutilizáveis.
    - Proibido: acesso a serviços reais, dependência de ordem, dados hardcoded.
    ```
    
- Conceito de skills: *"Skills encapsulam como gerar tipos específicos de outputs. Uma boa skill tem: contexto (quando usar), regras prescritivas, exemplos concretos (DO/DON'T), e anti-padrões."*

**Tarefa:**

1. Usando o **Claude**, crie o [SKILL.md](http://skill.md/) para `create-integration-test` (nível Artifact). Inclua:
    - Quando esta skill se aplica (frase-ativação).
    - Template de teste com placeholders.
    - 2 exemplos completos (DO: teste bem escrito; DON'T: teste com problemas comuns de IA).
    - Anti-padrões específicos de testes gerados por IA.
    - Dependências: quais skills Foundation e Domain devem ser lidas antes.
    
    [SKILL-create-integration-test.md](SKILL-create-integration-test.md)
    
2. Usando o **Claude Cowork**, crie um checklist de revisão de testes verificável em menos de 2 minutos por teste.

[checklist-revisao-integration-test-novatech.html](checklist-revisao-integration-test-novatech.html)

[checklist-revisao-integration-test-novatech.md](checklist-revisao-integration-test-novatech.md)

[queryHandler.bom.integration.test.ts](queryHandler.bom.integration.test.ts)

[queryHandler.ruim.integration.test.ts](queryHandler.ruim.integration.test.ts)

**Entregável:** O [SKILL.md](http://skill.md/) completo e o checklist de revisão gerado pelo Cowork.

**Critérios de avaliação:**

- A skill é concreta o suficiente para melhorar o output do Copilot.
- Os anti-padrões são reais (coisas que LLMs realmente geram de errado em testes).
- O checklist é rápido e objetivo.
- A skill é consistente com os Testing Standards fornecidos.