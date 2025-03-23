# Comprehensive Object-Oriented Programming and Clean Code Guidelines

## Core Object-Oriented Principles

1. **SOLID Principles as Foundation**
   - **Single Responsibility**: Each class must have exactly one reason to change and handle one cohesive set of related functionality
   - **Open/Closed**: Design components to be extended without modifying existing code; use inheritance, interfaces, and polymorphism
   - **Liskov Substitution**: Derived classes must be completely substitutable for their base classes without altering program correctness
   - **Interface Segregation**: Create focused, client-specific interfaces rather than monolithic ones; clients should only depend on methods they use
   - **Dependency Inversion**: High-level modules should not depend on low-level modules; both should depend on abstractions

2. **Encapsulation and Information Hiding**
   - Protect all class fields with appropriate access modifiers (private by default)
   - Implement getters/setters only when necessary and with proper validation
   - Bundle related data and operations within cohesive classes to prevent data leakage
   - Hide implementation details behind well-defined interfaces and public APIs
   - Use immutable objects when possible to enhance thread safety and reduce side effects

3. **Inheritance and Composition Strategy**
   - Favor composition over inheritance to avoid tight coupling and fragile class hierarchies
   - Use inheritance only for genuine "is-a" relationships with true specialization
   - Create abstract base classes to encapsulate common functionality and enforce contracts
   - Implement interfaces to define behavior contracts between components
   - Consider using delegation patterns when inheritance is inappropriate

4. **Polymorphism and Abstraction**
   - Use method overriding to implement polymorphic behavior
   - Design for polymorphism by programming to interfaces, not implementations
   - Create appropriate abstraction layers that hide complexity
   - Use abstract classes and interfaces to define clear contracts
   - Apply the Template Method pattern for algorithmic skeletons with customizable steps

## Clean Code Standards

5. **Naming Conventions and Readability**
   - Use descriptive, intention-revealing names for all identifiers
   - Follow consistent naming patterns (camelCase for methods/variables, PascalCase for classes)
   - Choose domain-specific terminology that accurately reflects business concepts
   - Avoid abbreviations except for widely recognized ones (e.g., HTTP, URL)
   - Use noun phrases for classes and verb phrases for methods

6. **Method and Function Design**
   - Limit methods to 20-30 lines maximum for comprehensibility
   - Ensure each method performs exactly one logical operation with a clear purpose
   - Use descriptive verb phrases for method names that reveal intent
   - Limit parameter count (3 or fewer when possible) to reduce complexity
   - Maintain consistent levels of abstraction within methods

7. **Code Organization and Structure**
   - Group related classes into logical packages/namespaces based on functionality
   - Maintain clear hierarchical structure in project organization
   - Separate interface definitions from implementations to promote loose coupling
   - Use design patterns appropriately to solve common problems without overengineering
   - Organize code to reflect the domain model and business processes

## UI and Feature Separation

8. **Strict UI and Feature Separation**
   - UI code must be completely isolated from feature/business logic
   - UI modifications must never affect underlying feature implementations
   - Feature code must never be modified when changing UI elements
   - If UI changes require feature modifications, alert with "*** Feature will be modified" warning
   - Implement proper interfaces between UI and feature layers to minimize coupling

9. **UI Modification Guidelines**
   - Limit UI changes to presentation concerns only (styling, layout, interaction patterns)
   - Use proper UI architectural patterns (MVC, MVVM, MVP) to maintain separation
   - Implement UI-specific interfaces that abstract feature interactions
   - Create adapter layers when necessary to connect UI to existing features
   - Document all UI-feature dependencies clearly

10. **Feature Protection Strategy**
    - Treat feature code as immutable when making UI changes
    - Use dependency injection to provide feature implementations to UI components
    - Implement feature facades to simplify UI-feature interactions
    - Create clear boundaries between UI and feature domains
    - Use events/observers for loose coupling between UI and features

## Modification Approach

11. **Change Implementation Strategy**
    - Analyze impact before making any change using dependency analysis
    - Implement the minimal viable modification to meet requirements without scope creep
    - Make changes incrementally with testable steps that can be validated individually
    - Preserve existing patterns and naming conventions for consistency
    - Consider backward compatibility and migration paths for existing clients

12. **Separation of Concerns**
    - Strictly separate UI logic from business logic and data access
    - Implement proper abstraction layers between system components (presentation, business, data)
    - Ensure UI changes don't affect business logic and vice versa through proper interfaces
    - Use appropriate architectural patterns (MVC, MVVM, Clean Architecture, etc.)
    - Separate configuration from implementation to enhance flexibility

13. **Debugging and Maintenance Focus**
    - Make all changes visible and traceable through proper logging and documentation
    - Add appropriate logging at key execution points with contextual information
    - Design for testability with dependency injection and mockable interfaces
    - Document complex algorithms and business rules with diagrams and examples
    - Create clear error handling strategies with meaningful error messages

## Implementation Workflow

14. **Before Implementation**
    - Understand the existing architecture, patterns, and coding standards
    - Identify the minimal scope of changes needed to fulfill requirements
    - Verify whether changes are purely UI-related or affect features
    - If feature code must be modified, prominently note "*** Feature will be modified"
    - Create a test plan covering both UI and feature integration points

15. **During Implementation**
    - Make one logical change at a time with clear commit messages
    - Follow existing code style and formatting conventions rigorously
    - Add/update unit tests for new functionality with high coverage
    - Maintain strict boundaries between UI and feature code
    - Use dependency injection and interfaces to minimize coupling

16. **After Implementation**
    - Verify all tests pass including regression tests
    - Confirm changes meet the original requirements through validation
    - Review for any code smells or potential refactoring opportunities
    - Ensure changes maintain or improve the overall architecture
    - Verify UI and feature layers remain properly separated

17. **Code Quality Metrics**
    - Maintain low cyclomatic complexity (ideally <10 per method)
    - Keep coupling low between modules (high cohesion, low coupling)
    - Monitor code duplication and extract common functionality
    - Ensure test coverage meets project standards (typically >80%)
    - Use static analysis tools to identify potential issues early

When generating or modifying code, always prioritize object-oriented design principles and clean code practices. Each change should be isolated, visible, and maintain the strict separation between UI and business logic. If any UI modification requires changes to feature code, prominently alert with "*** Feature will be modified" in your response. All implementations should facilitate easy debugging and future modifications without requiring extensive refactoring. All responses should conclude with "OO is considered" to confirm adherence to object-oriented principles.