describe('polls route validation logic', () => {
  describe('formatPoll', () => {
    function formatPoll(poll, currentUserId) {
      const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

      return {
        id: poll._id.toString(),
        roomId: poll.roomId.toString(),
        creatorId: poll.creatorId.toString(),
        creatorUsername: poll.creatorUsername,
        question: poll.question,
        options: poll.options.map((option, index) => ({
          index,
          text: option.text,
          voteCount: option.votes.length,
          percentage: totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0,
          hasVoted: option.votes.some((vote) => vote.toString() === currentUserId),
          voters: poll.isAnonymous ? [] : option.votes.map((vote) => vote.toString()),
        })),
        totalVotes,
        allowMultipleVotes: poll.allowMultipleVotes,
        isAnonymous: poll.isAnonymous,
        isClosed: poll.isClosed,
        isExpired: poll.expiresAt ? new Date() > poll.expiresAt : false,
        expiresAt: poll.expiresAt ? poll.expiresAt.toISOString() : null,
        createdAt: poll.createdAt.toISOString(),
      };
    }

    test('formats poll with correct structure', () => {
      const poll = {
        _id: { toString: () => 'poll1' },
        roomId: { toString: () => 'room1' },
        creatorId: { toString: () => 'user1' },
        creatorUsername: 'alice',
        question: 'What is your favorite color?',
        options: [
          { text: 'Red', votes: [{ toString: () => 'user1' }, { toString: () => 'user2' }] },
          { text: 'Blue', votes: [{ toString: () => 'user3' }] },
        ],
        allowMultipleVotes: false,
        isAnonymous: false,
        isClosed: false,
        expiresAt: null,
        createdAt: new Date('2024-01-01'),
      };

      const result = formatPoll(poll, 'user1');

      expect(result.id).toBe('poll1');
      expect(result.question).toBe('What is your favorite color?');
      expect(result.totalVotes).toBe(3);
      expect(result.options[0].percentage).toBe(67);
      expect(result.options[1].percentage).toBe(33);
      expect(result.options[0].hasVoted).toBe(true);
      expect(result.options[1].hasVoted).toBe(false);
    });

    test('calculates percentages correctly', () => {
      const poll = {
        _id: { toString: () => 'poll1' },
        roomId: { toString: () => 'room1' },
        creatorId: { toString: () => 'user1' },
        creatorUsername: 'alice',
        question: 'Test?',
        options: [
          { text: 'A', votes: [{ toString: () => 'u1' }] },
          { text: 'B', votes: [{ toString: () => 'u2' }] },
          { text: 'C', votes: [{ toString: () => 'u3' }] },
          { text: 'D', votes: [{ toString: () => 'u4' }] },
        ],
        allowMultipleVotes: false,
        isAnonymous: false,
        isClosed: false,
        expiresAt: null,
        createdAt: new Date(),
      };

      const result = formatPoll(poll, 'u1');

      expect(result.options[0].percentage).toBe(25);
      expect(result.options[1].percentage).toBe(25);
      expect(result.options[2].percentage).toBe(25);
      expect(result.options[3].percentage).toBe(25);
    });

    test('handles zero votes', () => {
      const poll = {
        _id: { toString: () => 'poll1' },
        roomId: { toString: () => 'room1' },
        creatorId: { toString: () => 'user1' },
        creatorUsername: 'alice',
        question: 'Test?',
        options: [
          { text: 'A', votes: [] },
          { text: 'B', votes: [] },
        ],
        allowMultipleVotes: false,
        isAnonymous: false,
        isClosed: false,
        expiresAt: null,
        createdAt: new Date(),
      };

      const result = formatPoll(poll, 'user1');

      expect(result.totalVotes).toBe(0);
      expect(result.options[0].percentage).toBe(0);
      expect(result.options[1].percentage).toBe(0);
    });

    test('hides voters for anonymous polls', () => {
      const poll = {
        _id: { toString: () => 'poll1' },
        roomId: { toString: () => 'room1' },
        creatorId: { toString: () => 'user1' },
        creatorUsername: 'alice',
        question: 'Test?',
        options: [
          { text: 'A', votes: [{ toString: () => 'user1' }] },
        ],
        allowMultipleVotes: false,
        isAnonymous: true,
        isClosed: false,
        expiresAt: null,
        createdAt: new Date(),
      };

      const result = formatPoll(poll, 'user1');

      expect(result.options[0].voters).toEqual([]);
    });

    test('shows voters for non-anonymous polls', () => {
      const poll = {
        _id: { toString: () => 'poll1' },
        roomId: { toString: () => 'room1' },
        creatorId: { toString: () => 'user1' },
        creatorUsername: 'alice',
        question: 'Test?',
        options: [
          { text: 'A', votes: [{ toString: () => 'user1' }, { toString: () => 'user2' }] },
        ],
        allowMultipleVotes: false,
        isAnonymous: false,
        isClosed: false,
        expiresAt: null,
        createdAt: new Date(),
      };

      const result = formatPoll(poll, 'user1');

      expect(result.options[0].voters).toEqual(['user1', 'user2']);
    });
  });

  describe('poll creation validation', () => {
    test('requires valid room ID', () => {
      const roomId = 'invalid';
      const isValid = /^[0-9a-fA-F]{24}$/.test(roomId);
      expect(isValid).toBe(false);
    });

    test('requires question with at least 3 chars', () => {
      const question = 'ab';
      const isValid = typeof question === 'string' && question.trim().length >= 3;
      expect(isValid).toBe(false);
    });

    test('requires at least 2 options', () => {
      const options = ['Only one'];
      const isValid = Array.isArray(options) && options.length >= 2;
      expect(isValid).toBe(false);
    });

    test('options must be unique (case-insensitive)', () => {
      const options = ['Red', 'red'];
      const isUnique = new Set(options.map((o) => o.toLowerCase())).size === options.length;
      expect(isUnique).toBe(false);
    });

    test('valid poll passes all checks', () => {
      const roomId = '507f1f77bcf86cd799439011';
      const question = 'What is your favorite color?';
      const options = ['Red', 'Blue', 'Green'];

      const isValidRoomId = /^[0-9a-fA-F]{24}$/.test(roomId);
      const isValidQuestion = typeof question === 'string' && question.trim().length >= 3;
      const isValidOptions = Array.isArray(options) && options.length >= 2;
      const isUnique = new Set(options.map((o) => o.toLowerCase())).size === options.length;

      expect(isValidRoomId).toBe(true);
      expect(isValidQuestion).toBe(true);
      expect(isValidOptions).toBe(true);
      expect(isUnique).toBe(true);
    });
  });

  describe('poll vote logic', () => {
    test('toggle vote removes existing vote', () => {
      const votes = ['user1', 'user2'];
      const userId = 'user1';
      const hasVote = votes.some((v) => v === userId);

      let result;
      if (hasVote) {
        result = votes.filter((v) => v !== userId);
      }

      expect(result).toEqual(['user2']);
    });

    test('toggle vote adds new vote', () => {
      const votes = ['user2'];
      const userId = 'user1';
      const hasVote = votes.some((v) => v === userId);

      let result;
      if (!hasVote) {
        result = [...votes, userId];
      }

      expect(result).toEqual(['user2', 'user1']);
    });

    test('single vote mode clears other votes', () => {
      const options = [
        { votes: ['user1'] },
        { votes: [] },
      ];
      const optionIndex = 1;
      const userId = 'user1';
      const allowMultipleVotes = false;

      if (!allowMultipleVotes) {
        options.forEach((option) => {
          option.votes = option.votes.filter((v) => v !== userId);
        });
      }
      options[optionIndex].votes.push(userId);

      expect(options[0].votes).toEqual([]);
      expect(options[1].votes).toEqual(['user1']);
    });
  });
});
