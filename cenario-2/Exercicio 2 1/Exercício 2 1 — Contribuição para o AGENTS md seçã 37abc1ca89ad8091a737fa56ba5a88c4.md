# Exercício 2.1 — Contribuição para o AGENTS.md: seção de Testing Standards

**Contexto:** O Tech Lead pediu que você escreva a seção de padrões de teste do AGENTS.md que todo agente de IA deve seguir ao gerar código de teste.

**Ferramentas a utilizar:** Claude (chat)

**Inputs fornecidos:**

- O cenário completo.
- As decisões técnicas do Tech Lead: *"Vitest para testes unitários e de integração. Mocks com msw (Mock Service Worker) para APIs externas. Testes rodam no CI via GitHub Actions. Coverage mínimo: 80% de linhas."*
- Um exemplo de teste ruim gerado por IA (simulado):
    
    ```tsx
    // Teste gerado pelo Copilot sem guidance
    test('query endpoint works', async () => {
      const result = await handler({ body: '{"question": "test"}' });
      expect(result).toBeDefined();
    });
    ```
    

**Tarefa:**

1. Usando o **Claude**, escreva a seção **"Testing Standards"** do AGENTS.md. Inclua:
    - Padrão de nomenclatura de testes (describe/it com frases descritivas em inglês).
    - O que todo teste DEVE ter (arrange/act/assert, assertions específicas).
    - O que todo teste NÃO DEVE ter (acesso a serviços reais, dependência de ordem, assertions vagas).
    - Padrão de mocking (msw para HTTP, factories para dados).
    - Padrão de fixtures (dados reutilizáveis para testes de RAG — perguntas, chunks, respostas esperadas).
    
    [Conversa com Chat Claude - Tarefa 1.txt](Conversa_com_Chat_Claude_-_Tarefa_1.txt)
    
    [AGENTS-testing-standards.md](AGENTS-testing-standards.md)
    
2. Reescreva o teste ruim seguindo seus padrões. Mostre antes/depois, explicando cada melhoria.
    
    [Reescrevendo_o_teste_ruim.md](Reescrevendo_o_teste_ruim.md)
    
3. Defina ao menos 3 critérios que um código de teste gerado por IA deve atender para passar no code review de QA.
    
    [Critérios de Review e Aprovação para Testes Gerados pela IA.md](Critrios_de_Review_e_Aprovao_para_Testes_Gerados_pela_IA.md)
    

**Entregável:** A seção Testing Standards do AGENTS.md, o teste reescrito com explicações, e os critérios de review.

**Critérios de avaliação:**

- A seção é prescritiva o suficiente para que o Copilot gere testes melhores.
- O teste reescrito demonstra os padrões na prática.
- Os critérios de review são objetivos (dois QAs chegariam à mesma conclusão).