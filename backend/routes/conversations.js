const express = require('express');
const authMiddleware = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const { getConversationInsight, refreshConversationInsight } = require('../services/conversationInsights');

const router = express.Router();

// GET /api/conversations - List user's conversations
// OPTIMIZED: Uses MongoDB aggregation pipeline to compute messageCount and
// lastMessage at the database level, avoiding loading the entire messages array
// into Node.js memory. For conversations with hundreds of messages, this
// reduces memory usage from O(messages) to O(conversations) and shifts
// computation to the database engine which is optimized for this work.
router.get('/', authMiddleware, async (req, res) => {
  try {
    const matchStage = { userId: req.user.id };
    if (req.query.projectId) {
      matchStage.projectId = req.query.projectId === 'none' ? null : req.query.projectId;
    }

    // Aggregation pipeline: match → sort → limit → project computed fields → lookup project
    const conversations = await Conversation.aggregate([
      { $match: matchStage },
      { $sort: { updatedAt: -1 } },
      { $limit: 50 },
      {
        $project: {
          title: 1,
          createdAt: 1,
          updatedAt: 1,
          sourceType: 1,
          sourceLabel: 1,
          projectId: 1,
          projectName: 1,
          // Compute message count without loading the array into JS
          messageCount: { $size: { $ifNull: ['$messages', []] } },
          // Extract only the last message's content (first 100 chars)
          // $arrayElemAt with -1 gets the last element efficiently
          lastMessage: {
            $let: {
              vars: { msgs: { $ifNull: ['$messages', []] } },
              in: {
                $cond: {
                  if: { $gt: [{ $size: '$$msgs' }, 0] },
                  then: {
                    $substrCP: [
                      { $arrayElemAt: ['$$msgs.content', -1] },
                      0,
                      100,
                    ],
                  },
                  else: '',
                },
              },
            },
          },
        },
      },
    ]);

    // Batch-fetch project names to avoid N+1 queries
    const projectIds = [...new Set(
      conversations
        .map((c) => c.projectId)
        .filter(Boolean)
        .map((id) => id.toString())
    )];

    let projectMap = {};
    if (projectIds.length > 0) {
      const Project = require('../models/Project');
      const projects = await Project.find({ _id: { $in: projectIds } })
        .select('name description')
        .lean();
      projectMap = Object.fromEntries(
        projects.map((p) => [p._id.toString(), { id: p._id.toString(), name: p.name, description: p.description || '' }])
      );
    }

    res.json(conversations.map((conversation) => ({
      id: conversation._id.toString(),
      title: conversation.title,
      project: conversation.projectId
        ? projectMap[conversation.projectId.toString()] || null
        : conversation.projectName
          ? { id: '', name: conversation.projectName, description: '' }
          : null,
      sourceType: conversation.sourceType || 'native',
      sourceLabel: conversation.sourceLabel || 'ChatSphere',
      messageCount: conversation.messageCount,
      lastMessage: conversation.lastMessage || '',
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    })));
  } catch (err) {
    console.error('List conversations error:', err);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

// GET /api/conversations/:id - Get full conversation
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })
      .populate('projectId', 'name description')
      .lean();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      id: conversation._id.toString(),
      title: conversation.title,
      project: conversation.projectId ? {
        id: conversation.projectId._id.toString(),
        name: conversation.projectId.name,
        description: conversation.projectId.description || '',
      } : conversation.projectName ? {
        id: '',
        name: conversation.projectName,
        description: '',
      } : null,
      sourceType: conversation.sourceType || 'native',
      sourceLabel: conversation.sourceLabel || 'ChatSphere',
      messages: conversation.messages.map((message) => ({
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        memoryRefs: message.memoryRefs || [],
        fileUrl: message.fileUrl || null,
        fileName: message.fileName || null,
        fileType: message.fileType || null,
        fileSize: message.fileSize || null,
        modelId: message.modelId || null,
        provider: message.provider || null,
        requestedModelId: message.requestedModelId || null,
        processingMs: message.processingMs ?? null,
        promptTokens: message.promptTokens ?? null,
        completionTokens: message.completionTokens ?? null,
        totalTokens: message.totalTokens ?? null,
        autoMode: Boolean(message.autoMode),
        autoComplexity: message.autoComplexity || null,
        fallbackUsed: Boolean(message.fallbackUsed),
      })),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ error: 'Failed to load conversation' });
  }
});

// GET /api/conversations/:id/insights
router.get('/:id/insights', authMiddleware, async (req, res) => {
  try {
    const insight = await getConversationInsight(req.user.id, req.params.id, req.query.modelId || null);
    res.json(insight || null);
  } catch (err) {
    console.error('Get conversation insight error:', err);
    res.status(500).json({ error: 'Failed to load conversation insight' });
  }
});

// POST /api/conversations/:id/actions/:action
router.post('/:id/actions/:action', authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).select('_id').lean();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const insight = await refreshConversationInsight(req.user.id, conversation._id, req.body?.modelId || null);
    if (!insight) {
      return res.json({ insight: null, summary: '', decisions: [], actionItems: [] });
    }

    const action = req.params.action;
    if (action === 'summarize') {
      return res.json({ summary: insight.summary, insight });
    }

    if (action === 'extract-tasks') {
      return res.json({ actionItems: insight.actionItems || [], insight });
    }

    if (action === 'extract-decisions') {
      return res.json({ decisions: insight.decisions || [], insight });
    }

    return res.status(400).json({ error: 'Unsupported action' });
  } catch (err) {
    console.error('Conversation action error:', err);
    res.status(500).json({ error: 'Failed to run conversation action' });
  }
});

// DELETE /api/conversations/:id - Delete conversation
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Conversation.deleteOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    console.error('Delete conversation error:', err);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

module.exports = router;
