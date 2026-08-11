import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { blocker, proceed, reset } = vi.hoisted(() => ({
	blocker: { proceed: vi.fn(), reset: vi.fn(), state: 'blocked' },
	proceed: vi.fn(),
	reset: vi.fn(),
}));

vi.mock('react-router', () => ({
	useBeforeUnload: vi.fn(),
	useBlocker: () => ({ ...blocker, proceed, reset }),
}));

import { useDiscardConfirmation } from './use-discard-confirmation';

function DiscardConfirmation() {
	return <>{useDiscardConfirmation(true)}</>;
}

describe('変更破棄確認', () => {
	afterEach(() => {
		proceed.mockClear();
		reset.mockClear();
	});

	it('遷移がブロックされたときに確認を表示し、編集継続または破棄を選べる', () => {
		render(<DiscardConfirmation />);

		expect(screen.getByRole('heading', { name: '変更を破棄しますか？' })).toBeInTheDocument();
		fireEvent.click(screen.getByRole('button', { name: '編集を続ける' }));
		expect(reset).toHaveBeenCalledOnce();
		fireEvent.click(screen.getByRole('button', { name: '破棄する' }));
		expect(proceed).toHaveBeenCalledOnce();
	});
});
