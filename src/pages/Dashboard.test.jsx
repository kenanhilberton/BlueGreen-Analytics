import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard.jsx';

vi.mock('../components/ui/GridDistortion.jsx', () => ({ default: () => null }));
vi.mock('../components/CarbonGlobe.jsx', () => ({ default: () => null }));

vi.mock('recharts', () => {
  const NullChart = () => null;
  return {
    AreaChart: NullChart,
    Area: NullChart,
    XAxis: NullChart,
    YAxis: NullChart,
    CartesianGrid: NullChart,
    Tooltip: NullChart,
    Legend: NullChart,
    ResponsiveContainer: NullChart,
    BarChart: NullChart,
    Bar: NullChart,
    PieChart: NullChart,
    Pie: NullChart,
    Cell: NullChart,
    RadarChart: NullChart,
    PolarGrid: NullChart,
    PolarAngleAxis: NullChart,
    Radar: NullChart
  };
});

const openChat = () => {
  fireEvent.click(screen.getByRole('button', { name: '🤖 BlueGreen AI' }));
};

const ask = (question) => {
  fireEvent.change(screen.getByPlaceholderText('İstənilən sualınızı yazın...'), {
    target: { value: question }
  });
  fireEvent.click(screen.getByRole('button', { name: '➔' }));
};

describe('Dashboard AI chat', () => {
  let fetchMock;
  let chatCalls;
  let onLogout;

  beforeEach(() => {
    localStorage.clear();
    chatCalls = 0;
    onLogout = vi.fn();

    fetchMock = vi.fn(async (url) => {
      const target = String(url);

      if (target.includes('/api/ai/status')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ configured: true, provider: 'gemini', model: 'gemini-3.1-flash-lite' })
        };
      }

      if (target.includes('/api/ai/chat')) {
        chatCalls += 1;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            answer: `AI answer ${chatCalls}`,
            provider: 'gemini',
            model: 'gemini-3.1-flash-lite'
          })
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({
          co2Emission: 44,
          energyConsumption: 48,
          waterUsage: 3500,
          wasteRecycled: 76,
          hseIncidents: 320,
          trainingHours: 18,
          timestamp: '2026-11-22T10:00:00Z'
        })
      };
    });

    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const renderDashboard = () => render(
    <Dashboard onLogout={onLogout} userEmail="aitest01@example.com" companyName="AITEST01" token="test-token" />
  );

  it('opens with a robot button and hides the chat scrollbar', async () => {
    renderDashboard();
    openChat();

    await waitFor(() => {
      expect(document.getElementById('star-border-styles')).not.toBeNull();
    });

    const messages = document.querySelector('.ai-chat-messages');
    expect(messages).not.toBeNull();
    expect(messages.style.overflowY).toBe('auto');
    expect(document.getElementById('star-border-styles').textContent).toContain('scrollbar-width: none');
    expect(screen.getByText('BlueGreen AI Core')).toBeInTheDocument();
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('sends chat history to the backend, persists messages, and clears them', async () => {
    const view = renderDashboard();
    openChat();

    await waitFor(() => expect(screen.getByText(/LLM: gemini/)).toBeInTheDocument());

    ask('Who is Carl Charles?');
    expect(await screen.findByText('AI answer 1')).toBeInTheDocument();

    ask('What does he do?');
    expect(await screen.findByText('AI answer 2')).toBeInTheDocument();

    const chatRequests = fetchMock.mock.calls
      .filter(([url]) => String(url).includes('/api/ai/chat'))
      .map(([, options]) => JSON.parse(options.body));

    expect(chatRequests).toHaveLength(2);
    expect(chatRequests[0].message).toBe('Who is Carl Charles?');
    expect(chatRequests[1].message).toBe('What does he do?');
    expect(chatRequests[1].history).toEqual(expect.arrayContaining([
      { role: 'user', content: 'Who is Carl Charles?' },
      { role: 'assistant', content: 'AI answer 1' }
    ]));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('bg_ai_chat'));
      expect(saved.some((message) => message.text === 'Who is Carl Charles?')).toBe(true);
      expect(saved.some((message) => message.text === 'AI answer 2')).toBe(true);
    });

    view.unmount();
    renderDashboard();
    openChat();

    expect(await screen.findByText('Who is Carl Charles?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear chat' }));

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('bg_ai_chat'))).toEqual([]);
    });
    expect(screen.queryByText('Who is Carl Charles?')).not.toBeInTheDocument();
  });
});
