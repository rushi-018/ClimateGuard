# Contributing to ClimateGuard

We love your input! We want to make contributing to ClimateGuard as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start for Contributors

1. **Fork the repository** and clone your fork
2. **Install dependencies**: `npm install`
3. **Start development server**: `npm run dev`
4. **Make your changes** and test them thoroughly
5. **Submit a pull request** with a clear description

## 📋 Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests
Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

### Coding Standards

- **TypeScript**: Use strict TypeScript for all new code
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Commit Messages**: Use [Conventional Commits](https://conventionalcommits.org/)

Example commit message:
```
feat(voice-qa): add support for multiple languages

- Add language detection for voice input
- Implement translation service integration
- Update UI to show supported languages

Closes #123
```

### Component Guidelines

- **Accessibility**: All components must be accessible (WCAG 2.1 AA)
- **Mobile-first**: Design for mobile devices first
- **Performance**: Consider performance implications of all changes
- **TypeScript**: Proper type definitions for all props and state

## 🐛 Report Bugs

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/rushi-018/ClimateGuard/issues).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening)

## 💡 Feature Requests

We welcome feature requests! Before creating a new feature request:

1. **Check existing issues** to avoid duplicates
2. **Clearly describe the feature** and its use case
3. **Consider the scope** - is this a core feature or an extension?
4. **Think about implementation** - how would this work technically?

## 🧪 Testing

- **Unit Tests**: Write unit tests for new functionality
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test critical user flows
- **Accessibility Tests**: Ensure components meet accessibility standards

Run tests with:
```bash
npm test
npm run test:e2e
npm run test:accessibility
```

## 📚 Documentation

- **Code Comments**: Document complex algorithms and business logic
- **Component Docs**: Document all props, events, and usage examples
- **API Documentation**: Keep API docs up to date
- **README Updates**: Update README.md when adding significant features

## 🌍 Climate Impact Focus

When contributing, remember our mission is climate resilience:

- **Data Accuracy**: Climate data must be accurate and reliable
- **Scientific Validity**: Follow climate science best practices
- **User Impact**: Consider how changes help users build climate resilience
- **Global Perspective**: Think about users worldwide, not just local contexts

## 📞 Community

- **Discussions**: Use GitHub Discussions for questions and ideas
- **Issues**: Use Issues for bugs and feature requests
- **Pull Requests**: Use PRs for code contributions
- **Twitter**: Follow [@ClimateGuardAI](https://twitter.com/ClimateGuardAI) for updates

## 🏷️ Issue Labels

We use labels to organize issues:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority-high`: High priority issues
- `climate-data`: Related to climate data and APIs
- `ai-ml`: Related to AI/ML features
- `accessibility`: Related to accessibility improvements

## 🎯 Priority Areas

We're especially interested in contributions in these areas:

1. **Climate Data Sources**: Integration with new climate APIs
2. **Machine Learning**: Improved prediction models
3. **Accessibility**: Making the platform more accessible
4. **Internationalization**: Supporting more languages
5. **Mobile Experience**: Improving mobile performance and UX
6. **Voice Features**: Enhancing the voice Q&A system
7. **Carbon Calculations**: More accurate carbon impact modeling

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

All contributors will be recognized in our README and releases. Significant contributors may be invited to join the core team.

Thank you for helping make ClimateGuard better! 🌍