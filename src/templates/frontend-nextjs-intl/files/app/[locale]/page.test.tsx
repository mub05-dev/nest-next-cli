import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import HomePage from './page';
import messages from '../../messages/es.json';

describe('HomePage', () => {
  it('renderiza el título principal', () => {
    render(
      <NextIntlClientProvider locale="es" messages={messages}>
        <HomePage />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
