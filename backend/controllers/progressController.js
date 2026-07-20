import { db } from '../config/firebase.js';

// Get current progress plan
export const getProgress = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required.' });
    }

    try {
        const docRef = db.collection('timetables').doc(userId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.json({ message: 'No progress plan found for this user.', plan: null });
        }

        return res.json({ plan: doc.data() });
    } catch (error) {
        console.error('❌ Firestore read error:', error.message);
        return res.status(500).json({ error: 'Failed to retrieve progress data.', details: error.message });
    }
};

// Set or update progress plan
export const saveProgress = async (req, res) => {
    const { userId } = req.params;
    const { plan } = req.body;

    if (!userId || !plan) {
        return res.status(400).json({ error: 'userId and plan object are required.' });
    }

    try {
        const docRef = db.collection('timetables').doc(userId);
        await docRef.set(plan, { merge: true });
        
        return res.json({ message: 'Progress saved successfully.', plan });
    } catch (error) {
        console.error('❌ Firestore write error:', error.message);
        return res.status(500).json({ error: 'Failed to save progress data.', details: error.message });
    }
};
