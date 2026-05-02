export const CATEGORIES = [
    { id: 'all', name: 'All Categories', colorClass: 'bg-primary/10 text-primary border-primary/20' },
    { id: 'science', name: 'Science & Nature', colorClass: 'bg-secondary/10 text-secondary border-secondary/20' },
    { id: 'history', name: 'History', colorClass: 'bg-tertiary/10 text-tertiary border-tertiary/20' },
    { id: 'tech', name: 'Computers & Tech', colorClass: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
    { id: 'general', name: 'General Knowledge', colorClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
];

export const MOCK_QUIZZES = [
    {
        id: 1,
        title: 'Ultimate Science Challenge',
        category: 'Science',
        categoryId: 17, // OpenTDB Science & Nature
        difficulty: 'medium',
        questionCount: 10,
        durationMinutes: 15,
        avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka'],
        participantCount: 124
    },
    {
        id: 2,
        title: 'History of the World',
        category: 'History',
        categoryId: 23, // OpenTDB History
        difficulty: 'hard',
        questionCount: 15,
        durationMinutes: 20,
        avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi'],
        participantCount: 89
    },
    {
        id: 3,
        title: 'Tech Geeks Trivia',
        category: 'Tech',
        categoryId: 18, // OpenTDB Computers
        difficulty: 'medium',
        questionCount: 10,
        durationMinutes: 10,
        avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Brian', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica'],
        participantCount: 256
    },
    {
        id: 4,
        title: 'General Knowledge Mix',
        category: 'General',
        categoryId: 9, // OpenTDB General Knowledge
        difficulty: 'easy',
        questionCount: 20,
        durationMinutes: 15,
        avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'],
        participantCount: 512
    }
];
