### Por que o primeiro teste é ruim?

```ts
test('query endpoint works', async () => {
  const result = await handler({ body: '{"question": "test"}' });
  expect(result).toBeDefined();
});
```

Ele valida apenas que a função retornou alguma coisa.
Mesmo que a resposta esteja errada, sem citação ou com dados incompletos, o teste continuará passando.
Ou seja, **ele não valida o requisito de negócio nem o contrato da API.**

---

Na minha visão para validar a resposta do RAG deve ser retornado na API algumas informações relevantes, como o documento usando na citação, a página, a url, etc.
Supondo que a resposta esperada seja:

```json
{
  "answer": "Segundo a política...",
  "citation": {
    "documentName": "Employee Handbook.pdf",
    "sections": ["Vacation Policy", "Benefits"],
    "page": 12,
    "url": "https://company.com/docs/employee-handbook.pdf"
  }
}
```

O teste bom irá validar explicitamente que a resposta contém:

* Nome do documento
* Seções referenciadas
* Página
* URL da fonte

```ts
it('should return the answer with document name, referenced sections, page number and source URL', async () => {
  // Arrange
  const event = {
    body: JSON.stringify({
      question: 'How many vacation days do employees receive?'
    })
  }

  // Act
  const result = await handler(event);
  const body = JSON.parse(result.body);

  // Assert
  expect(body).toMatchObject({
    answer: expect.any(String),
    citation: {
      documentName: expect.any(String),
      sections: expect.arrayContaining([
        expect.any(String)
      ]),
      page: expect.any(Number),
      url: expect.stringMatching(/^https?:\/\//)
    }
  })
})
```

Esse teste protege o requisito funcional. Se algum campo obrigatório da citação for removido ou retornar em formato incorreto, o teste falha.
