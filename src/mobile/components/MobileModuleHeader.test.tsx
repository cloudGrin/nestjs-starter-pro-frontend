import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MobileModuleHeader } from './MobileModuleHeader';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe('MobileModuleHeader', () => {
  it('opens the module menu and navigates to another H5 module', () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <MobileModuleHeader title="今天" subtitle="家庭任务" />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /menu/ }));
    fireEvent.click(screen.getByText('家庭保险'));

    expect(screen.getByTestId('location')).toHaveTextContent('/insurance');
  });
});
