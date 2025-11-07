import { useEffect } from 'react'

export default function PopupComplete() {
  useEffect(() => {
    // Get auth code from URL
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')

    if (window.opener) {
      // Send result to parent window
      window.opener.postMessage({
        type: 'OAUTH_RESULT',
        code,
        state,
        error
      }, '*')
      
      // Close popup
      window.close()
    } else {
      // Fallback if no opener
      console.log('OAuth result:', { code, state, error })
    }
  }, [])

  return (
    <div className="modal-container">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Authentication Complete</h2>
          <p>Redirecting...</p>
        </div>
      </div>
    </div>
  )
}