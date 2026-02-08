# Contributing to JobSync AI

Thank you for your interest in contributing to JobSync AI! We welcome contributions from the community to help make this project better for everyone.

## Table of Contents
- [How Can I Contribute?](#how-can-i-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Your First Code Contribution](#your-first-code-contribution)
- [Pull Request Process](#pull-request-process)
- [Code of Conduct](#code-of-conduct)

## How Can I Contribute?
You can contribute by:
- Reporting bugs.
- Suggesting new features.
- Improving documentation.
- Submitting pull requests to fix bugs or add features.

## Reporting Bugs
Before reporting a bug, please search existing issues to see if it has already been reported. When reporting, include:
- A clear, descriptive title.
- Steps to reproduce the bug.
- Actual vs. expected behavior.
- Screenshots if applicable.

## Suggesting Enhancements
Feature requests are welcome! Please provide a clear description of the enhancement and why it would be useful.

## Development Setup

We recommend using **Docker** for local development to ensure environment consistency.

1.  **Fork and Clone**:
    ```bash
    git clone https://github.com/your-username/job_search.git
    cd job_search
    ```

2.  **Environment Variables**:
    - Backend: Copy `backend/.env.example` to `backend/.env` and add your `GOOGLE_API_KEY`.
    - Frontend: Copy `frontend/.env.example` to `frontend/.env` (if applicable).

3.  **Run with Docker**:
    ```bash
    docker-compose up --build
    ```
    The app will be available at `http://localhost:8080`.

4.  **Manual Setup (Optional)**:
    If you prefer running without Docker, refer to the "Manual Setup" section in the `README.md`.

## Contribution Guidelines

1.  **Branching**:
    - Use `feature/` for new features (e.g., `feature/add-dark-mode`).
    - Use `fix/` for bug fixes (e.g., `fix/login-error`).
    - Use `docs/` for documentation updates.

2.  **Commits**:
    - Write clear, concise commit messages.
    - Start with a verb (e.g., "Add...", "Fix...", "Update...").

3.  **Pull Requests**:
    - detailed description of changes.
    - Screenshots for UI changes.
    - Ensure all tests pass (if available).


## Pull Request Process
- Ensure your code follows the project's style and quality standards.
- Update the `README.md` or other documentation if necessary.
- Your PR will be reviewed by maintainers before merging.

## Code of Conduct
This project and everyone participating in it are governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.
