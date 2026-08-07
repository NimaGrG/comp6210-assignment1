import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const subjects = [
  {
    id: 'SCP-002', slug: 'scp-002', objectClass: 'Euclid', status: 'CONTAINED', image: 'images/scp-002.jpg',
    summary: 'A biological room that converts living humans into furnishings.', sectionCount: 2, recordLength: 120,
    sections: [
      { title: 'Special Containment Procedures', content: ['Keep the subject connected to power.'] },
      { title: 'Description', content: ['SCP-002 resembles a fleshy growth.'] },
    ],
  },
  {
    id: 'SCP-005', slug: 'scp-005', objectClass: 'Safe', status: 'CONTAINED', image: 'images/scp-005.jpg',
    summary: 'An ornate key capable of opening most locks.', sectionCount: 2, recordLength: 95,
    sections: [
      { title: 'Special Containment Procedures', content: ['Level 4 approval is required.'] },
      { title: 'Description', content: ['SCP-005 resembles an ornate key.'] },
    ],
  },
]

beforeEach(() => {
  window.location.hash = ''
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(subjects) })
})

describe('SCP catalogue application', () => {
  it('loads JSON records and opens the first subject', async () => {
    render(<App />)
    expect(screen.getByText(/decrypting subject archive/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'SCP-002', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('2 records available')).toBeInTheDocument()
  })

  it('searches across subject content', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'SCP-002', level: 1 })
    await user.type(screen.getByRole('searchbox', { name: /search scp records/i }), 'ornate key')
    expect(screen.getByText('1 record available')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'SCP-005', level: 1 })).toBeInTheDocument()
  })

  it('filters subjects by object class', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'SCP-002', level: 1 })
    await user.click(screen.getByRole('button', { name: 'Safe' }))
    expect(screen.getByText('1 record available')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'SCP-005', level: 1 })).toBeInTheDocument()
  })

  it('opens a selected record and updates the URL hash', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'SCP-002', level: 1 })
    await user.click(screen.getByRole('option', { name: /SCP-005/i }))
    expect(screen.getByRole('heading', { name: 'SCP-005', level: 1 })).toBeInTheDocument()
    expect(window.location.hash).toBe('#scp-005')
  })

  it('supports keyboard navigation between records', async () => {
    render(<App />)
    await screen.findByRole('heading', { name: 'SCP-002', level: 1 })
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' })
    expect(screen.getByRole('heading', { name: 'SCP-005', level: 1 })).toBeInTheDocument()
  })

  it('shows a retry control if the JSON request fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'))
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Archive connection failed')
    expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument()
  })

  it('copies a link to the current record', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')
    render(<App />)
    await screen.findByRole('heading', { name: 'SCP-002', level: 1 })
    await user.click(screen.getByRole('button', { name: /copy record link/i }))
    await waitFor(() => expect(writeText).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: /link copied/i })).toBeInTheDocument()
  })
})
