// src/query/queryHandler.integration.test.ts
// Arquivo de EXEMPLO RUIM — deve reprovar em múltiplos itens do checklist
// Cada violação está comentada com o ID do item que viola
// Simula o padrão gerado por IA sem contexto de domínio

import { describe, test, expect, vi } from 'vitest';
import { queryHandler } from './queryHandler';

// ❌ VIOLA 1.1 — server.listen com onUnhandledRequest: 'error' ausente
// ❌ VIOLA 1.2 — afterEach com resetHandlers ausente
// ❌ VIOLA 1.3 — afterAll com server.close ausente
// Nenhum lifecycle msw configurado — chamadas HTTP podem ir para produção.

// ❌ VIOLA 1.4 — vi.mock no módulo HTTP em vez de server.use via msw
vi.mock('../../services/azureOpenAI', () => ({
  createEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  generateAnswer:  vi.fn().mockResolvedValue('Some answer.'),
}));

vi.mock('../../services/azureSearch', () => ({
  searchChunks: vi.fn().mockResolvedValue([
    // ❌ VIOLA 2.2 — DocumentChunk criado inline sem factory
    // ❌ VIOLA 2.3 — source inválido 'document.pdf' / 'test.pdf'
    { id: 'chunk-001', content: 'Some content', score: 0.8, metadata: { source: 'document.pdf' } },
    { id: 'chunk-002', content: 'More content', score: 0.7, metadata: { source: 'test.pdf' } },
  ]),
}));

// ❌ VIOLA 3.1 — describe sem sufixo (integration)
// ❌ VIOLA 3.2 — describe interno sem "when [cenário]"
describe('queryHandler', () => {

  // ❌ VIOLA 3.3 — nome genérico, não descreve resultado observável
  test('query endpoint works', async () => {

    // ❌ VIOLA 3.5 — setTimeout arbitrário
    await new Promise(r => setTimeout(r, 2000));

    // ❌ VIOLA 2.1 — pergunta inline inventada sem fixture
    // ❌ VIOLA 2.4 — queryFactory não utilizado
    const result = await queryHandler({ body: '{"question": "test"}' });

    // ❌ VIOLA 4.1 — statusCode não assertido
    // ❌ VIOLA 4.4 — assertion trivial de existência
    expect(result).toBeDefined();
  });

  test('returns answer with citation', async () => {
    // ❌ VIOLA 2.1 — string inline de pergunta
    const result = await queryHandler({ body: '{"question": "what is delivery?"}' });
    const body = JSON.parse(result.body);

    // ❌ VIOLA 4.1 — statusCode com toBeTruthy (passa para 404, 500, qualquer truthy)
    expect(result.statusCode).toBeTruthy();

    // ❌ VIOLA 4.2 — citation sem toMatchObject e sem os 4 campos
    expect(body.citation).toBeTruthy();

    // ❌ VIOLA 4.4 — toBeDefined como verificação principal
    expect(body.answer).toBeDefined();

    // ❌ VIOLA 5.1 — sem valor concreto de negócio (prazo/política)
    expect(body.answer.length).toBeGreaterThan(0);

    // ❌ VIOLA 5.4 — toBe com string literal exata (flaky por design)
    expect(body.answer).toBe('Standard shipping to major Brazilian capitals takes 3 to 5 business days after dispatch.');

    // ❌ VIOLA 6.1 — sem not.toMatch para política desatualizada
    // ❌ VIOLA 6.2 — sem not.toMatch para campos internos
    // ❌ VIOLA 6.4 — stackTrace não verificado
  });

  test('handles error case', async () => {
    // ❌ VIOLA 2.1 — string inline
    const result = await queryHandler({ body: '{"question": "hello"}' });
    const body = JSON.parse(result.body);

    // ❌ VIOLA 5.3 — código canônico de erro não assertido com toBe
    expect(body.error).toBeDefined();

    // ❌ VIOLA 6.3 — sem not.toMatch para internals de serviço
    // ❌ VIOLA 6.4 — stackTrace não verificado
    expect(result.statusCode).toBeGreaterThan(0);
  });

  // ❌ VIOLA 3.2 — describe sem cenário concreto
  describe('edge cases', () => {

    // ❌ VIOLA 3.3 — nome sem resultado observável
    test('is ok', async () => {
      const result = await queryHandler({ body: '{"question": "foo"}' });
      // ❌ VIOLA 4.4 — assertion semanticamente vazia
      expect(result).not.toBeNull();
      // ❌ VIOLA 5.2 — fallback sem groundingConfidence e sources
    });

    test('basic test', async () => {
      const result = await queryHandler({ body: '{"question": "bar"}' });
      const body = JSON.parse(result.body);
      // ❌ VIOLA 4.1 — statusCode não assertido
      // ❌ VIOLA 6.2 — campos internos não verificados
      expect(body.answer).not.toBeNull();
    });
  });

  // ❌ VIOLA 3.5 — outro setTimeout
  test('handles async correctly', async () => {
    await new Promise(r => setTimeout(r, 1500));
    const result = await queryHandler({ body: '{"question": "test"}' });
    expect(result).toBeDefined();
  });

});

// BLOQUEANTES violados: 1.1 1.2 1.3 1.4 2.1 2.2 2.3 3.2 3.3 3.5 4.1 4.4 5.1 5.3 6.1 6.2 6.3 6.4
// ALERTAS violados: 2.4 3.1 3.4 5.4 7.1 7.2
