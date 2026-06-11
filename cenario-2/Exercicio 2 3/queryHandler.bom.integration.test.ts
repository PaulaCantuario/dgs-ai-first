// src/query/queryHandler.integration.test.ts
// Arquivo de EXEMPLO BOM — deve passar em todos os itens do checklist
// Segue o padrão definido em SKILL-create-integration-test.md

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../tests/msw/server';
import { questions } from '../../tests/fixtures/questions';
import { chunks } from '../../tests/fixtures/chunks';
import { queryFactory } from '../../tests/factories/queryFactory';
import { chunkFactory } from '../../tests/factories/chunkFactory';
import { queryHandler } from './queryHandler';

// ─── MSW LIFECYCLE ──────────────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── SUITE ──────────────────────────────────────────────────────────────────
describe('QueryHandler (integration)', () => {

  // TC-INT-007
  describe('when a valid question matches high-relevance chunks in the knowledge base', () => {
    it('returns HTTP 200 with a grounded answer, full citation, and no internal fields exposed', async () => {
      // ARRANGE
      server.use(
        http.post('https://novatech.openai.azure.com/openai/deployments/text-embedding-3-small/embeddings', () =>
          HttpResponse.json({
            data: [{ embedding: Array(1536).fill(0.1), index: 0 }],
            model: 'text-embedding-3-small',
          })
        ),
        http.post('https://novatech.search.windows.net/indexes/novatech-docs/docs/search', () =>
          HttpResponse.json({ value: [chunks.highRelevance, chunks.mediumRelevance] })
        )
      );
      const request = queryFactory({ question: questions.deliveryTime });

      // ACT
      const response = await queryHandler(request);
      const body = JSON.parse(response.body);

      // ASSERT — mustContain
      expect(response.statusCode).toBe(200);
      expect(body.answer).toMatch(/3\s*to\s*5\s*business days/i);
      expect(body.groundingConfidence).toBe('high');
      expect(body.citation).toMatchObject({
        documentName: expect.any(String),
        page: expect.any(Number),
        url: expect.stringMatching(/^https?:\/\//),
        sections: expect.arrayContaining([expect.any(String)]),
      });
      expect(body.sources).toHaveLength(2);
      expect(body.sources).toEqual(
        expect.arrayContaining([expect.objectContaining({ chunkId: chunks.highRelevance.id })])
      );

      // ASSERT — mustNotContain
      expect(body.answer).not.toMatch(/7\s*to\s*10\s*business days/i);
      expect(body.answer).not.toMatch(/chunk-|chunkId:|score:/i);
      expect(body.answer).not.toMatch(/error|exception|undefined|null/i);
      expect(body.citation.documentName).not.toMatch(/2021|2022|2023/);
      expect(body).not.toHaveProperty('stackTrace');
    });
  });

  // TC-INT-009
  describe('when the question is outside the knowledge base scope', () => {
    it('returns HTTP 200 with groundingConfidence none, empty sources, and no fabricated answer', async () => {
      // ARRANGE
      server.use(
        http.post('https://novatech.openai.azure.com/openai/deployments/text-embedding-3-small/embeddings', () =>
          HttpResponse.json({ data: [{ embedding: Array(1536).fill(0.0), index: 0 }] })
        ),
        http.post('https://novatech.search.windows.net/indexes/novatech-docs/docs/search', () =>
          HttpResponse.json({ value: [] })
        )
      );
      const request = queryFactory({ question: questions.outOfScope });

      // ACT
      const response = await queryHandler(request);
      const body = JSON.parse(response.body);

      // ASSERT — mustContain
      expect(response.statusCode).toBe(200);
      expect(body.groundingConfidence).toBe('none');
      expect(body.answer).toMatch(/don't have.*information|not able to answer/i);
      expect(body.sources).toHaveLength(0);
      expect(body.citation).toBeUndefined();

      // ASSERT — mustNotContain
      expect(body.answer).not.toMatch(/Paris|capital|France|soccer/i);
      expect(body.answer).not.toMatch(/openai|azure|vector|embedding/i);
    });
  });

  // TC-INT-011
  describe('when the embedding API is unavailable', () => {
    it('returns HTTP 503 with upstream_unavailable error code and no internal details leaked', async () => {
      // ARRANGE
      server.use(
        http.post('https://novatech.openai.azure.com/openai/deployments/text-embedding-3-small/embeddings', () =>
          HttpResponse.error()
        )
      );
      const request = queryFactory({ question: questions.trackingDelay });

      // ACT
      const response = await queryHandler(request);
      const body = JSON.parse(response.body);

      // ASSERT — mustContain
      expect(response.statusCode).toBe(503);
      expect(body.error).toBe('upstream_unavailable');

      // ASSERT — mustNotContain
      expect(body.error).not.toMatch(/openai|azure|fetch|ECONNREFUSED/i);
      expect(body).not.toHaveProperty('stackTrace');
      expect(body).not.toHaveProperty('cause');
    });
  });

  // TC-INT-014
  describe('when documents with conflicting SLAs exist and the newer one must prevail', () => {
    it('returns the SLA from shipping-policy-2024 and excludes chunks from obsolete documents', async () => {
      // ARRANGE
      const currentChunk = chunkFactory({
        score: 0.92,
        metadata: { source: 'shipping-policy-2024.pdf', page: 3, section: 'Standard Delivery SLA' }
      });
      const obsoleteChunk = chunkFactory({
        score: 0.85,
        metadata: { source: 'shipping-policy-2021.pdf', page: 5, section: 'Old SLA Table' }
      });
      server.use(
        http.post('https://novatech.openai.azure.com/openai/deployments/text-embedding-3-small/embeddings', () =>
          HttpResponse.json({ data: [{ embedding: Array(1536).fill(0.1), index: 0 }] })
        ),
        http.post('https://novatech.search.windows.net/indexes/novatech-docs/docs/search', () =>
          HttpResponse.json({ value: [currentChunk, obsoleteChunk] })
        )
      );
      const request = queryFactory({ question: questions.deliveryTime });

      // ACT
      const response = await queryHandler(request);
      const body = JSON.parse(response.body);

      // ASSERT — mustContain
      expect(response.statusCode).toBe(200);
      expect(body.answer).toMatch(/3\s*to\s*5\s*business days/i);
      expect(body.citation.documentName).toBe('shipping-policy-2024.pdf');

      // ASSERT — mustNotContain
      expect(body.answer).not.toMatch(/7\s*to\s*10\s*business days/i);
      expect(body.citation.documentName).not.toMatch(/2021|2022|2023/);
    });
  });

});
