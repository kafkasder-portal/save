import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, mockMeeting, mockUser } from '../../test/utils'
import MeetingsIndex from '../meetings/Index'

// Mock the API
vi.mock('../../api/meetings', () => ({
  meetingsApi: {
    getMeetings: vi.fn(),
    createMeeting: vi.fn(),
    updateMeeting: vi.fn(),
    deleteMeeting: vi.fn(),
    getAttendees: vi.fn(),
    addAttendee: vi.fn(),
    updateAttendeeStatus: vi.fn(),
    getAgenda: vi.fn(),
    addAgendaItem: vi.fn(),
    updateAgendaItem: vi.fn(),
    deleteAgendaItem: vi.fn()
  }
}))

// Mock auth store
vi.mock('../../store/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: mockUser({ role: 'admin' }),
    isAuthenticated: true
  }))
}))

// Mock permissions hook
vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: vi.fn(() => ({
    permissions: ['manage_meetings', 'view_meetings', 'create_meeting'],
    hasPermission: (permission: string) => ['manage_meetings', 'view_meetings', 'create_meeting'].includes(permission),
    canManageUsers: true
  }))
}))

describe('Meetings Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful API responses
    const { meetingsApi } = require('../../api/meetings')
    meetingsApi.getMeetings.mockResolvedValue([
      mockMeeting({ id: '1', title: 'Team Standup' }),
      mockMeeting({ id: '2', title: 'Project Review' })
    ])
    meetingsApi.getAttendees.mockResolvedValue([])
  })

  it('renders meetings list correctly', async () => {
    render(<MeetingsIndex />)

    // Check if page title is rendered
    expect(screen.getByText('Toplantılar')).toBeInTheDocument()

    // Wait for meetings to load
    await waitFor(() => {
      expect(screen.getByText('Team Standup')).toBeInTheDocument()
      expect(screen.getByText('Project Review')).toBeInTheDocument()
    })
  })

  it('allows creating a new meeting', async () => {
    const { meetingsApi } = require('../../api/meetings')
    const newMeeting = mockMeeting({ title: 'New Meeting' })
    meetingsApi.createMeeting.mockResolvedValue(newMeeting)

    render(<MeetingsIndex />)

    // Click create meeting button
    const createButton = screen.getByText('Yeni Toplantı')
    fireEvent.click(createButton)

    // Check if create modal opens
    await waitFor(() => {
      expect(screen.getByText('Toplantı Oluştur')).toBeInTheDocument()
    })

    // Fill out the form
    const titleInput = screen.getByLabelText(/toplantı başlığı/i)
    fireEvent.change(titleInput, { target: { value: 'New Meeting' } })

    const descriptionInput = screen.getByLabelText(/açıklama/i)
    fireEvent.change(descriptionInput, { target: { value: 'Meeting description' } })

    // Submit the form
    const submitButton = screen.getByText('Toplantı Oluştur')
    fireEvent.click(submitButton)

    // Verify API was called
    await waitFor(() => {
      expect(meetingsApi.createMeeting).toHaveBeenCalledWith({
        title: 'New Meeting',
        description: 'Meeting description',
        date: expect.any(String),
        duration: expect.any(Number),
        location: expect.any(String)
      })
    })
  })

  it('allows editing existing meeting', async () => {
    const { meetingsApi } = require('../../api/meetings')
    meetingsApi.updateMeeting.mockResolvedValue(
      mockMeeting({ id: '1', title: 'Updated Meeting' })
    )

    render(<MeetingsIndex />)

    // Wait for meetings to load
    await waitFor(() => {
      expect(screen.getByText('Team Standup')).toBeInTheDocument()
    })

    // Click edit button for first meeting
    const editButtons = screen.getAllByLabelText(/düzenle/i)
    fireEvent.click(editButtons[0])

    // Check if edit modal opens
    await waitFor(() => {
      expect(screen.getByText('Toplantı Düzenle')).toBeInTheDocument()
    })

    // Update the title
    const titleInput = screen.getByDisplayValue('Team Standup')
    fireEvent.change(titleInput, { target: { value: 'Updated Meeting' } })

    // Submit the form
    const saveButton = screen.getByText('Değişiklikleri Kaydet')
    fireEvent.click(saveButton)

    // Verify API was called
    await waitFor(() => {
      expect(meetingsApi.updateMeeting).toHaveBeenCalledWith('1', {
        title: 'Updated Meeting'
      })
    })
  })

  it('allows deleting a meeting', async () => {
    const { meetingsApi } = require('../../api/meetings')
    meetingsApi.deleteMeeting.mockResolvedValue(undefined)

    render(<MeetingsIndex />)

    // Wait for meetings to load
    await waitFor(() => {
      expect(screen.getByText('Team Standup')).toBeInTheDocument()
    })

    // Click delete button for first meeting
    const deleteButtons = screen.getAllByLabelText(/sil/i)
    fireEvent.click(deleteButtons[0])

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText('Toplantıyı Sil')).toBeInTheDocument()
    })

    const confirmButton = screen.getByText('Sil')
    fireEvent.click(confirmButton)

    // Verify API was called
    await waitFor(() => {
      expect(meetingsApi.deleteMeeting).toHaveBeenCalledWith('1')
    })
  })

  it('displays loading state while fetching meetings', () => {
    const { meetingsApi } = require('../../api/meetings')
    // Return a promise that never resolves to simulate loading
    meetingsApi.getMeetings.mockReturnValue(new Promise(() => {}))

    render(<MeetingsIndex />)

    // Check for loading indicator
    expect(screen.getByText(/yükleniyor/i)).toBeInTheDocument()
  })

  it('displays error state when API fails', async () => {
    const { meetingsApi } = require('../../api/meetings')
    meetingsApi.getMeetings.mockRejectedValue(new Error('API Error'))

    render(<MeetingsIndex />)

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/hata oluştu/i)).toBeInTheDocument()
    })
  })

  it('filters meetings by search term', async () => {
    render(<MeetingsIndex />)

    // Wait for meetings to load
    await waitFor(() => {
      expect(screen.getByText('Team Standup')).toBeInTheDocument()
      expect(screen.getByText('Project Review')).toBeInTheDocument()
    })

    // Search for specific meeting
    const searchInput = screen.getByPlaceholderText(/ara/i)
    fireEvent.change(searchInput, { target: { value: 'Team' } })

    // Check that only matching meeting is shown
    await waitFor(() => {
      expect(screen.getByText('Team Standup')).toBeInTheDocument()
      expect(screen.queryByText('Project Review')).not.toBeInTheDocument()
    })
  })

  it('shows meeting details when clicked', async () => {
    render(<MeetingsIndex />)

    // Wait for meetings to load
    await waitFor(() => {
      expect(screen.getByText('Team Standup')).toBeInTheDocument()
    })

    // Click on meeting to view details
    fireEvent.click(screen.getByText('Team Standup'))

    // Check if detail modal opens
    await waitFor(() => {
      expect(screen.getByText('Toplantı Detayları')).toBeInTheDocument()
    })
  })
})
