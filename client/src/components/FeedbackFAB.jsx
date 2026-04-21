import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

const FeedbackFAB = () => {
    const [feedbackOpen, setFeedbackOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setFeedbackOpen(true)}
                className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
            >
                Feedback
            </button>
            <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
        </>
    );
};

export default FeedbackFAB;