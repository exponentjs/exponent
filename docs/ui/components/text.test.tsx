import { render } from '@testing-library/react';
import React from 'react';

import { createTextComponent, TextElements } from './text';

describe(createTextComponent, () => {
  it('renders created text element components', () => {
    Object.values(TextElements).forEach(element => {
      const Heading = createTextComponent(element);
      const { container } = render(<Heading />);

      expect(container.getElementsByTagName(element).length).toBe(1);
    });
  });
});
