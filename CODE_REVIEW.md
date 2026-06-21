# ChatSphere Code Review Guide

## Overview

Standards and checklists for reviewing code contributions.

---

## Review Principles

1. **Be constructive**: Suggest improvements, don't just criticize
2. **Ask questions**: "Why did you choose X over Y?" is better than "X is wrong"
3. **Approve with nits**: Small style issues shouldn't block merging
4. **Test locally**: Pull the branch and verify it works
5. **Focus on impact**: Prioritize security, bugs, and architecture over style

---

## Review Checklist

### Functionality

- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Loading states handled
- [ ] No regressions introduced

### Security

- [ ] Input validated on server
- [ ] Authentication checked
- [ ] Authorization checked
- [ ] No secrets in code
- [ ] No SQL injection risk
- [ ] No XSS risk
- [ ] Rate limiting applied

### Performance

- [ ] No unnecessary re-renders
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Appropriate indexes used
- [ ] No memory leaks

### Code Quality

- [ ] Functions are small and focused
- [ ] Variables are well-named
- [ ] No code duplication
- [ ] Comments explain "why", not "what"
- [ ] TypeScript types are correct

### Testing

- [ ] Tests added for new code
- [ ] Edge cases tested
- [ ] Error states tested
- [ ] Tests pass locally

### Documentation

- [ ] README updated if needed
- [ ] API docs updated if needed
- [ ] Comments added for complex logic
- [ ] CHANGELOG updated

---

## Common Review Comments

### Good Review Comments

```
"Consider using useMemo here to avoid recalculating on every render."

"This query could benefit from a compound index on {roomId, createdAt}."

"Should we add error handling for the case where the API returns an error?"

"Nice use of the builder pattern here! Clean and readable."
```

### Avoid These Comments

```
"Wrong." (not constructive)
"This is bad." (not specific)
"Change this." (not explaining why)
Nit-picking every style preference
```

---

## Approval Criteria

### Approve When

- Code works correctly
- Security is not compromised
- Performance is acceptable
- Tests are adequate
- Documentation is updated

### Request Changes When

- Bugs or security issues found
- Performance problems
- Missing tests for critical code
- No documentation for public APIs

### Comment When

- Suggestions for improvement
- Questions about approach
- Minor style issues (nits)
- Learning opportunities

---

## Review Workflow

```
1. Author creates PR
   ↓
2. Reviewer reads PR description
   ↓
3. Reviewer checks CI status
   ↓
4. Reviewer reads code changes
   ↓
5. Reviewer tests locally (if needed)
   ↓
6. Reviewer leaves comments
   ↓
7. Author addresses feedback
   ↓
8. Reviewer approves
   ↓
9. PR merged
```

---

## File-Specific Checks

### Frontend Components

- [ ] Props are typed
- [ ] ARIA attributes present
- [ ] Keyboard navigation works
- [ ] Loading/error states handled
- [ ] Memoization where needed

### Backend Routes

- [ ] Input validation present
- [ ] Auth middleware applied
- [ ] Error responses consistent
- [ ] Status codes correct
- [ ] Logging added

### Database Models

- [ ] Indexes defined
- [ ] Required fields marked
- [ ] Default values set
- [ ] Validation rules present
- [ ] Timestamps enabled

### AI Services

- [ ] Error handling robust
- [ ] Fallback logic present
- [ ] Rate limiting applied
- [ ] Token usage tracked
- [ ] Response validated

---

## Template: PR Review

```markdown
## Review Summary

[Brief summary of what was reviewed]

## Findings

### Critical (must fix)
- [ ] Issue 1

### Suggestions (nice to have)
- Suggestion 1

### Nits (style/minor)
- Nit 1

## Testing

- [ ] Tested locally
- [ ] All tests pass

## Verdict

[Approve / Request Changes / Comment]
```

---

## Metrics

### Review Quality

- Time to first review: < 24 hours
- Review completion: < 48 hours
- Comments per PR: 3-10 (quality over quantity)
- Approval rate: > 80% on first review

### Code Quality

- Test coverage: > 70%
- Lint errors: 0
- TypeScript errors: 0
- Security vulnerabilities: 0
