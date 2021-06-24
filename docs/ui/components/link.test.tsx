import { render } from '@testing-library/react';
import React from 'react';

import { Link } from './link';

describe(Link, () => {
  test('renders <a> tag with correct external href', () => {
    const href = 'https://github.com/expo';

    const { container } = render(<Link href={href} />);

    expect(container.querySelector('a')).toBeTruthy();
    expect(container.querySelector('a')?.getAttribute('href')).toBe(href);
  });

  test('renders <a> tag with correct internal href', () => {
    const href = '/tools';

    const { container } = render(<Link href={href} />);

    expect(container.querySelector('a')).toBeTruthy();
    expect(container.querySelector('a')?.getAttribute('href')).toBe(href);
  });
});
