// TryCatch: simple middleware wrapper for async route handlers.
// It reduces repetition by catching any thrown errors and sending a 500 response.
const TryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            // Call the actual handler the user defined
            await handler (req, res, next);
        } catch (error) {
            // If any error bubbles up, respond with a 500 and the error message.
            res.status(500).json({
                message: error.message,
            })
        }
    }
}

export default TryCatch;