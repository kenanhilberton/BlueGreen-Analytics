import { describe, expect, it } from 'vitest';
import { buildAiReply, buildWelcomeMessage, getSuggestedQuestions } from './aiAssistant.js';

const metrics = {
  co2: 42,
  energy: 55,
  water: 3100,
  waste: 78,
  hse: 330,
  training: 21
};

describe('buildAiReply', () => {
  it('identifies itself as BlueGreen AI', () => {
    const reply = buildAiReply({ question: 'Who are you?', lang: 'en', metrics });
    expect(reply).toContain('BlueGreen AI');
    expect(reply).toContain('ESG');
  });

  it('answers broad "who is" questions with useful guidance instead of a refusal', () => {
    const az = buildAiReply({ question: 'Carl Charles kimdi?', lang: 'az', metrics });
    const en = buildAiReply({ question: 'Who is Carl Charles?', lang: 'en', metrics });

    expect(az).toContain('Carl Charles');
    expect(az).toContain('Hansı sahə');
    expect(en).toContain('Carl Charles');
    expect(en).toContain('Tell me the field');
  });

  it('uses the dedicated ESG knowledge base', () => {
    const reply = buildAiReply({ question: 'Paris Sazişi nədir?', lang: 'az', metrics });
    expect(reply).toContain('Paris Sazişi');
    expect(reply).toContain('1.5°C');
  });

  it('includes current metrics in topic answers', () => {
    const reply = buildAiReply({ question: 'Karbon izi nədir?', lang: 'az', metrics });
    expect(reply).toContain('42.0 tCO₂e');
    expect(reply).toContain('Scope 1');
  });

  it('calculates simple arithmetic locally', () => {
    const reply = buildAiReply({ question: '12 * 3', lang: 'en', metrics });
    expect(reply).toContain('12 * 3 = 36');
  });

  it('keeps unknown questions contextual and non-empty', () => {
    const reply = buildAiReply({
      question: 'Mərkəzi Asiya haqqında nə bilirsiniz?',
      lang: 'az',
      metrics
    });
    expect(reply).toContain('Mərkəzi Asiya');
    expect(reply).toContain('Cari göstəricilər');
    expect(reply.length).toBeGreaterThan(100);
  });
});

describe('AI welcome and suggestions', () => {
  it('personalizes the welcome message with live metrics', () => {
    const message = buildWelcomeMessage({ lang: 'en', profileName: 'AITEST01', metrics });
    expect(message).toContain('AITEST01');
    expect(message).toContain('BlueGreen AI');
    expect(message).toContain('CO₂: 42.0 t');
  });

  it('returns four suggested questions in each language', () => {
    expect(getSuggestedQuestions('az')).toHaveLength(4);
    expect(getSuggestedQuestions('en')).toHaveLength(4);
    expect(getSuggestedQuestions('ru')).toHaveLength(4);
  });
});
