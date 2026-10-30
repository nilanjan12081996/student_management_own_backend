"""
Module: ai_notes_generator.py
Purpose: Generates Deep Multi-Layered Academic Study Notes powered by a
PyTorch Deep Convolutional Neural Network (1D-CNN) Feature Classifier.

Multi-Layer Architecture:
  - Layer 1: Executive Mental Model & Intuitive Analogy (Easy to understand!)
  - Layer 2: Theoretical Foundations & Formal Principles
  - Layer 3: Architecture & Execution Blueprint (Flow/Mechanism)
  - Layer 4: Real-World Implementation & Practical Code Walkthrough (Authentic Language Code!)
  - Layer 5: Edge Cases, Anti-Patterns & Common Exam Traps
  - Layer 6: Active Recall Knowledge Check (Diagnostic Self-Test)
  - Layer 7: Memory Anchors, Mnemonics & Exam Checklist
"""

import os
import json
import re
from deep_cnn_model import classify_topic_with_cnn

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# =====================================================================
# SPECIALIZED PEDAGOGICAL CONTENT TEMPLATES (DRIVEN BY DEEP CNN)
# =====================================================================

def get_java_methods_notes(topic: str, style: str, batch_name: str, cnn_meta: dict) -> dict:
    markdown = f"""# Java Methods: Functions, Signatures & Execution Mechanics
*Discipline: Java Programming • Cohort: {batch_name or 'All Batches'} • Standard: {style}*
*AI Engine: {cnn_meta.get('model_architecture')} (Category: java_methods, Conf: {cnn_meta.get('confidence')})*

---

## 📌 Layer 1: Executive Mental Model & Intuitive Overview
In Java, a **Method** is a reusable block of code designed to perform a specific task.
* **The Real-World Analogy (The Kitchen Blender):**
  Think of a Java method like a kitchen blender machine:
  1. **Inputs (Parameters):** You drop fruit and milk into the blender.
  2. **Execution Body (The Method Logic):** The blender spins its blades, executing the predefined instructions.
  3. **Output (Return Value):** It pours out a smoothie. If a method does not return anything, it is marked `void` (like a microwave beep that alerts you without producing a tangible physical item).
* **The Core Problem it Solves:** Without methods, developers would have to copy and paste the same 20 lines of code every time an action is repeated, creating huge, unmaintainable monolithic files where fixing a single bug requires editing 50 different places.

---

## 🏛️ Layer 2: Theoretical Foundations & Formal Principles
A Java method has five fundamental structural components:
1. **Method Signature:** Composed of the **method name** and its **parameter list (number and data types)**. The return type is NOT part of the signature!
   ```
   [access_modifier] [non-access_modifier] [return_type] methodName(parameterType parameterName)
   ```
2. **Pass-by-Value Semantics (CRITICAL RULE IN JAVA):** Java is **strictly pass-by-value, always**.
   * When you pass a primitive (`int`, `double`), a copy of the raw bit value is passed into the stack frame.
   * When you pass an Object (`String`, `List`, custom objects), a copy of the memory address reference is passed by value. Reassigning the reference parameter inside the method does NOT affect the caller!
3. **The Call Stack & Activation Records:** Each time a method is invoked, the JVM pushes a new **Stack Frame** onto the thread's Call Stack containing local variables and the instruction pointer. When the method returns, its frame is immediately popped and freed.
4. **Method Overloading vs Method Overriding:**
   * **Overloading:** Multiple methods in the **same class** sharing the same name but with **different parameter lists** (compile-time polymorphism).
   * **Overriding:** A child class providing a specific implementation of a method declared in its parent class (runtime dynamic dispatch).

---

## ⚙️ Layer 3: System Architecture & Execution Blueprint

```
[ Thread Call Stack in JVM Memory ]

┌──────────────────────────────────────────────┐
│  Stack Frame: calculateFinalPrice(...)       │  <-- Current Active Frame
│  - Local: double basePrice = 100.0           │      (Executes instructions,
│  - Local: double taxRate = 0.08              │       returns 108.0)
├──────────────────────────────────────────────┤
│  Stack Frame: processOrder(...)              │  <-- Suspended waiting for return
│  - Local: int orderId = 4092                 │
├──────────────────────────────────────────────┤
│  Stack Frame: main(String[] args)            │  <-- Base Thread Entry Point
└──────────────────────────────────────────────┘
```

---

## 💻 Layer 4: Production Implementation & Code Walkthrough (Pure Java)

```java
package com.academy.billing;

/**
 * Demonstrates best-practice Java method design,
 * access modifiers, defensive parameter checking, and overloading.
 */
public class PricingCalculator {{

    // 1. Standard Method with Primitive Parameters and Return Value
    public double calculateTotal(double unitPrice, int quantity) {{
        // Defensive parameter validation guard
        if (unitPrice < 0 || quantity <= 0) {{
            throw new IllegalArgumentException("Unit price and quantity must be positive values.");
        }}
        return unitPrice * quantity;
    }}

    // 2. Method Overloading (Same name, different parameter signature)
    public double calculateTotal(double unitPrice, int quantity, double discountPercentage) {{
        // Delegate to base method to prevent duplicated logic
        double subtotal = calculateTotal(unitPrice, quantity);
        
        if (discountPercentage < 0 || discountPercentage > 100) {{
            throw new IllegalArgumentException("Discount must be between 0 and 100 percent.");
        }}
        
        double discountAmount = subtotal * (discountPercentage / 100.0);
        return subtotal - discountAmount;
    }}

    // 3. Static Utility Method (Called directly via class name: PricingCalculator.formatCurrency)
    public static String formatCurrency(double amount) {{
        return String.format("$%.2f", amount);
    }}

    // Demonstration Entry Point
    public static void main(String[] args) {{
        PricingCalculator calc = new PricingCalculator();
        
        double regularTotal = calc.calculateTotal(25.50, 4);
        double discountedTotal = calc.calculateTotal(25.50, 4, 15.0); // 15% off

        System.out.println("Regular: " + PricingCalculator.formatCurrency(regularTotal));
        System.out.println("Discounted: " + PricingCalculator.formatCurrency(discountedTotal));
    }}
}}
```

---

## ⚠️ Layer 5: Edge Cases, Anti-Patterns & Common Exam Traps

| # | Common Java Method Exam Trap | Why It Fails | The Correct Java Solution |
|---|-----------------------------|--------------|---------------------------|
| 1 | **Attempting to Overload by Return Type Alone** | E.g. `int getData()` and `double getData()` in the same class. | Java compiler generates `duplicate method` error because return types are not evaluated in method call resolution. |
| 2 | **Assuming Pass-by-Reference in Java** | Believing `void swap(int a, int b)` can swap variables outside the method. | Java copies values into stack frames. You must return the updated result or encapsulate values inside a mutable container object. |
| 3 | **Unbounded Recursion** | A method calling itself without a guaranteed base case. | Exhausts the JVM stack memory, throwing `java.lang.StackOverflowError`. Always verify boundary base cases execute first. |

---

## 🧠 Layer 6: Active Recall Knowledge Check (Self-Test)
* **Question 1:** Can two methods in the same class have identical names and parameter types if their return types differ?
  * *Answer Key:* **No.** The compiler only considers the method name and parameter types (the method signature). Return type alone cannot disambiguate an invocation.
* **Question 2:** What is the difference between an argument and a parameter?
  * *Answer Key:* A **parameter** is the variable declared in the method definition signature. An **argument** is the actual value passed into the method during execution.
* **Question 3:** What happens if a non-void method does not return a value along one conditional `if/else` branch?
  * *Answer Key:* Compilation fails with: `error: missing return statement`. Every possible code branch must explicitly return a compatible type or throw an exception.

---

## 🚀 Layer 7: Memory Anchors & Quick Exam Checklist
* **Mnemonic — The S-I-G-N Rule for Java Methods:**
  * **S** — *Signature* defines identity (Name + Parameters)
  * **I** — *Inputs* are passed strictly by value
  * **G** — *Guards* validate pre-conditions at line 1
  * **N** — *Never* rely on return types for overloading
"""
    return {
        "title": "Java Methods — Multi-Layer Study Master",
        "topic": "Java Methods",
        "subject": "Java",
        "style": style,
        "topic_tags": ["Java Methods", "Method Overloading", "Call Stack & Parameters"],
        "content": markdown
    }


def get_java_oop_notes(topic: str, style: str, batch_name: str, cnn_meta: dict) -> dict:
    markdown = f"""# Java Object-Oriented Programming (OOP): The 4 Pillars & Design Architecture
*Discipline: Java Programming • Cohort: {batch_name or 'All Batches'} • Standard: {style}*
*AI Engine: {cnn_meta.get('model_architecture')} (Category: java_oop, Conf: {cnn_meta.get('confidence')})*

---

## 📌 Layer 1: Executive Mental Model & Intuitive Overview
**Object-Oriented Programming (OOP)** is an architectural paradigm that organizes code around real-world entities (Objects) possessing **State (data/fields)** and **Behavior (methods)**.
* **The Blueprint Analogy (Class vs Object):**
  * **Class:** The architectural blueprint of a car drawn on paper. You cannot drive a blueprint, but it defines all specifications (color, wheels, engine type).
  * **Object (Instance):** The physical red sports car manufactured on the factory floor from that blueprint. You can manufacture 10,000 distinct cars from one blueprint.
* **The Core Problem it Solves:** In procedural programming, global functions directly access and mutate global variables, causing spaghetti code where changing one variable breaks unrelated routines. OOP bundles data and functions together into protected, isolated capsules.

---

## 🏛️ Layer 2: Theoretical Foundations & The 4 Pillars
Every senior Java engineer structures software upon the **4 Pillars of OOP**:

1. **Encapsulation (Data Hiding):**
   * Keep fields `private` and provide access exclusively through `public` getters and setters.
   * *Analogy:* An ATM machine. You cannot reach your hand into the bank's physical vault; you must interact through the keypad interface that validates your PIN and balance.
2. **Inheritance (Code Reuse via 'extends'):**
   * Mechanism where a child/subclass inherits attributes and methods from an existing superclass.
   * Promotes hierarchical organization (e.g. `SavingsAccount extends BankAccount`).
3. **Polymorphism (Many Forms):**
   * The ability of an object to take on many forms.
   * *Compile-time (Static):* Method Overloading.
   * *Runtime (Dynamic):* Method Overriding where a parent reference invokes the overridden child method via virtual method dispatch (`BankAccount acc = new SavingsAccount(); acc.calculateInterest();`).
4. **Abstraction (Hiding Implementation Complexity):**
   * Hiding internal implementation details and exposing only essential functional interfaces via `abstract` classes and `interface`s.
   * *Analogy:* The accelerator pedal in your car. Pressing it speeds up the vehicle without requiring you to understand fuel injectors, valve timing, or transmission gears.

---

## ⚙️ Layer 3: System Architecture & Execution Blueprint

```
                      ┌────────────────────────────┐
                      │    <<abstract class>>      │
                      │        BankAccount         │
                      ├────────────────────────────┤
                      │ - accountNumber: String    │  <-- Encapsulation (Private)
                      │ - balance: double          │
                      ├────────────────────────────┤
                      │ + deposit(amount): void    │
                      │ + abstract calculateFee()  │  <-- Abstraction
                      └─────────────▲──────────────┘
                                    │ extends (Inheritance)
                      ┌─────────────┴──────────────┐
                      │       SavingsAccount       │
                      ├────────────────────────────┤
                      │ - interestRate: double     │
                      ├────────────────────────────┤
                      │ + calculateFee(): double   │  <-- Polymorphism (Overriding)
                      └────────────────────────────┘
```

---

## 💻 Layer 4: Production Implementation & Code Walkthrough (Pure Java)

```java
package com.academy.banking;

// Pillar 4: ABSTRACTION - Defines contract without exposing internal logic
abstract class BankAccount {{
    // Pillar 1: ENCAPSULATION - Private fields shielded from direct external corruption
    private final String accountNumber;
    private double balance;

    public BankAccount(String accountNumber, double initialBalance) {{
        if (initialBalance < 0) {{
            throw new IllegalArgumentException("Initial balance cannot be negative.");
        }}
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
    }}

    // Public getter protects internal representation
    public double getBalance() {{
        return this.balance;
    }}

    public String getAccountNumber() {{
        return this.accountNumber;
    }}

    public void deposit(double amount) {{
        if (amount <= 0) {{
            throw new IllegalArgumentException("Deposit amount must be positive.");
        }}
        this.balance += amount;
    }}

    // Abstract method must be implemented by concrete subclasses
    public abstract double calculateAnnualInterest();
}}

// Pillar 2: INHERITANCE - Reuses BankAccount state and behavior
class SavingsAccount extends BankAccount {{
    private final double interestRate;

    public SavingsAccount(String accountNumber, double initialBalance, double interestRate) {{
        super(accountNumber, initialBalance); // Call superclass constructor
        this.interestRate = interestRate;
    }}

    // Pillar 3: POLYMORPHISM - Overrides parent method with specialized behavior
    @Override
    public double calculateAnnualInterest() {{
        return getBalance() * (this.interestRate / 100.0);
    }}
}}

// Application Runner
public class BankApp {{
    public static void main(String[] args) {{
        // Dynamic Polymorphism: Parent reference pointing to child object
        BankAccount myAccount = new SavingsAccount("SA-9042", 5000.0, 4.5);
        
        myAccount.deposit(1000.0);
        System.out.println("Account: " + myAccount.getAccountNumber());
        System.out.println("Balance: $" + myAccount.getBalance());
        System.out.println("Projected Annual Interest: $" + myAccount.calculateAnnualInterest());
    }}
}}
```

---

## ⚠️ Layer 5: Edge Cases, Anti-Patterns & Common Exam Traps

| # | Common Java OOP Exam Trap | Why It Fails | The Correct Java Solution |
|---|---------------------------|--------------|---------------------------|
| 1 | **Multiple Class Inheritance** | Writing `class C extends A, B` causes compilation error (Diamond Problem). | Java does not permit multiple class inheritance. Implement multiple `interface`s instead (`implements X, Y`). |
| 2 | **Leaking Encapsulation via Mutable Objects** | Returning a `private Date` or `private List` reference directly in a getter. | External code can mutate internal state without using setters. Always return an unmodifiable view or defensive clone (`Collections.unmodifiableList(list)`). |
| 3 | **Forgetting 'super()' in Constructors** | Not calling `super(...)` when parent class lacks a no-argument default constructor. | Java compiler requires explicit `super(args)` on line 1 of child constructor if parent has custom parameters. |

---

## 🧠 Layer 6: Active Recall Knowledge Check (Self-Test)
* **Question 1:** What is the difference between an Abstract Class and an Interface in modern Java?
  * *Answer Key:* An **Abstract Class** can have instance state (non-static, non-final fields) and constructors, representing an *"is-a"* identity. An **Interface** represents a contract or capability (*"can-do"*), cannot store instance state, and supports multiple inheritance.
* **Question 2:** Why should class fields almost never be marked `public`?
  * *Answer Key:* Public fields violate encapsulation. Any external class can write invalid values (e.g. `account.balance = -99999`) bypassing all business validation rules.
* **Question 3:** What enables Runtime Polymorphism in Java?
  * *Answer Key:* **Dynamic Method Dispatch** (Virtual Method Table / vtable). The JVM inspects the actual object type at runtime rather than the reference variable type to determine which overridden method to execute.

---

## 🚀 Layer 7: Memory Anchors & Quick Exam Checklist
* **Mnemonic — The A-P-I-E Rule for Java OOP:**
  * **A** — *Abstraction* (Hide complexity, show essentials)
  * **P** — *Polymorphism* (One interface, multiple implementations)
  * **I** — *Inheritance* (Parent-child hierarchy with `extends`)
  * **E** — *Encapsulation* (Protect data with `private` and getters/setters)
"""
    return {
        "title": "Java Object-Oriented Programming (OOP) — Multi-Layer Study Master",
        "topic": "Java OOP",
        "subject": "Java",
        "style": style,
        "topic_tags": ["Java OOP", "Encapsulation & Inheritance", "Polymorphism & Abstraction"],
        "content": markdown
    }


def get_javascript_async_notes(topic: str, style: str, batch_name: str, cnn_meta: dict) -> dict:
    markdown = f"""# JavaScript Asynchronous Architecture: Event Loop, Microtasks & Promises
*Discipline: Web Development • Cohort: {batch_name or 'All Batches'} • Standard: {style}*
*AI Engine: {cnn_meta.get('model_architecture')} (Category: js_async, Conf: {cnn_meta.get('confidence')})*

---

## 📌 Layer 1: Executive Mental Model & Intuitive Overview
JavaScript is a **single-threaded, non-blocking asynchronous language**. It can execute only one line of code at any given instant on its single main Call Stack.
* **The Restaurant Kitchen Analogy:**
  * **The Waiter (Single Thread):** Takes your order and sends it to the kitchen.
  * **The Kitchen Cooks (Web APIs / Background Libuv):** Prepare food in the background (network fetch, disk read, timers).
  * **The Order Tray (Task Queue):** When food is ready, it waits in the tray.
  * **The Event Loop:** The waiter delivers the prepared food *only when they are not actively taking an order*. The waiter never freezes waiting for pasta to boil!

---

## 🏛️ Layer 2: Core Mechanics & The Two Priority Queues
1. **The Microtask Queue (Strict VIP Priority):**
   * Stores `Promise.then()`, `Promise.catch()`, `Promise.finally()`, and `queueMicrotask()`.
   * **Rule:** When the Call Stack empties, the Event Loop drains the **entire Microtask queue completely** before touching any Macrotask!
2. **The Macrotask (Task) Queue (Standard Priority):**
   * Stores `setTimeout()`, `setInterval()`, `setImmediate()`, and I/O callbacks.
   * **Rule:** Only one macrotask is executed per event loop iteration tick.

---

## 💻 Layer 3: Production Implementation (ES6+ Async/Await)

```javascript
// Clean async workflow with structured error boundaries
async function fetchUserProfile(userId) {{
  if (!userId) {{
    throw new TypeError("userId is required");
  }}

  try {{
    console.log("[1] Initiating network request...");
    const response = await fetch(`https://api.example.com/users/${{userId}}`);

    if (!response.ok) {{
      throw new Error(`HTTP Error: ${{response.status}}`);
    }}

    const userData = await response.json();
    console.log("[2] Successfully parsed user payload");
    return userData;
  }} catch (err) {{
    console.error("[3] Error caught gracefully in catch block:", err.message);
    throw err; // Re-throw or return fallback state
  }}
}}
```

---

## ⚠️ Layer 4: Common Exam Traps
* **Predicting Output Trap:**
  ```javascript
  console.log("A");
  setTimeout(() => console.log("B"), 0);
  Promise.resolve().then(() => console.log("C"));
  console.log("D");
  // Correct Output Order: A -> D -> C -> B
  // Reason: Synchronous (A, D) runs first. Then Microtask (C). Then Macrotask (B).
  ```
"""
    return {
        "title": "JavaScript Asynchronous Architecture — Multi-Layer Study Master",
        "topic": "JavaScript Async",
        "subject": "JavaScript",
        "style": style,
        "topic_tags": ["Event Loop", "Promises & Async/Await", "Microtasks"],
        "content": markdown
    }


def get_database_normalization_notes(topic: str, style: str, batch_name: str, cnn_meta: dict) -> dict:
    markdown = f"""# Relational Database Normalization: 1NF, 2NF, 3NF & BCNF
*Discipline: Database Engineering • Cohort: {batch_name or 'All Batches'} • Standard: {style}*
*AI Engine: {cnn_meta.get('model_architecture')} (Category: database_normalization, Conf: {cnn_meta.get('confidence')})*

---

## 📌 Layer 1: Executive Overview
**Normalization** is the systematic process of structuring relational database schemas to eliminate **data redundancy** and avoid **anomalies (Insertion, Update, Deletion)**.
* **The Closet Filing Analogy:**
  Instead of stuffing shirts, socks, and shoes into one giant drawer (causing chaos when you want to update one item), you create dedicated compartmentalized organizers linked by labels.

---

## 🏛️ Layer 2: The Normal Forms Step-by-Step
1. **First Normal Form (1NF) — Atomicity:**
   * Each cell contains single, atomic (indivisible) values. No comma-separated lists or repeating groups.
   * Every row must have a unique identifier (Primary Key).
2. **Second Normal Form (2NF) — No Partial Dependencies:**
   * Table must be in 1NF.
   * Every non-prime attribute must depend on the **entire candidate key**, not just a subset of a composite key.
3. **Third Normal Form (3NF) — No Transitive Dependencies:**
   * Table must be in 2NF.
   * No non-prime attribute should depend on another non-prime attribute (*"Every attribute must depend on the key, the whole key, and nothing but the key, so help me Codd"*).

---

## 💻 Layer 3: Normalized SQL Implementation

```sql
-- Clean 3NF Normalized Schema
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    office_location VARCHAR(100) NOT NULL
);

CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);
```
"""
    return {
        "title": "Relational Database Normalization — Multi-Layer Study Master",
        "topic": "Database Normalization",
        "subject": "Database Management Systems",
        "style": style,
        "topic_tags": ["1NF, 2NF, 3NF", "Functional Dependencies", "Schema Design"],
        "content": markdown
    }


# =====================================================================
# UNIVERSAL ADAPTIVE GENERATOR
# =====================================================================
def generate_adaptive_notes(topic: str, subject: str, style: str, batch_name: str, cnn_meta: dict) -> dict:
    clean_topic = topic.strip().title()
    clean_subj = subject.strip().title() if subject else "Computer Science"
    is_java = "java" in clean_subj.lower() or "java" in clean_topic.lower()
    is_python = "python" in clean_subj.lower() or "python" in clean_topic.lower()

    code_lang = "java" if is_java else ("python" if is_python else "javascript")
    code_example = ""

    if is_java:
        code_example = f"""public class {clean_topic.replace(' ', '')}Demo {{
    private String name;

    public {clean_topic.replace(' ', '')}Demo(String name) {{
        this.name = name;
    }}

    // Illustrates core execution for {clean_topic}
    public void execute() {{
        System.out.println("Processing " + this.name + " under Java principles.");
    }}

    public static void main(String[] args) {{
        {clean_topic.replace(' ', '')}Demo demo = new {clean_topic.replace(' ', '')}Demo("Java {clean_topic}");
        demo.execute();
    }}
}}"""
    elif is_python:
        code_example = f"""class {clean_topic.replace(' ', '')}Demo:
    def __init__(self, name: str):
        self.name = name

    def execute(self) -> dict:
        \"\"\"Demonstrates robust execution for {clean_topic}.\"\"\"
        return {{"status": "SUCCESS", "topic": "{clean_topic}", "name": self.name}}

if __name__ == "__main__":
    demo = {clean_topic.replace(' ', '')}Demo("Python {clean_topic}")
    print(demo.execute())"""
    else:
        code_example = f"""// Clean implementation pattern for {clean_topic}
function execute{clean_topic.replace(' ', '')}(options = {{}}) {{
  const timestamp = new Date().toISOString();
  return Object.freeze({{
    topic: "{clean_topic}",
    timestamp,
    status: "PROCESSED"
  }});
}}"""

    markdown = f"""# {clean_topic} — Comprehensive Study Master Note
*Discipline: {clean_subj} • Cohort: {batch_name or 'All Enrolled Batches'} • Standard: {style}*
*AI Engine: {cnn_meta.get('model_architecture')} (Category: {cnn_meta.get('category')}, Conf: {cnn_meta.get('confidence')})*

---

## 📌 Layer 1: Executive Mental Model & Intuitive Overview
**{clean_topic}** is a core concept in {clean_subj}.
* **The Mental Model:**
  Think of **{clean_topic}** as a modular building block. Rather than handling every operation as one indivisible unit, {clean_topic} establishes clean boundaries, modular responsibilities, and clear input-to-output transformations.
* **Why it Matters:**
  Mastering {clean_topic} enables students to write predictable, maintainable, and testable solutions, eliminating avoidable runtime bugs and performance regressions.

---

## 🏛️ Layer 2: Theoretical Foundations & Principles
1. **Separation of Concerns:** {clean_topic} isolates distinct responsibilities to ensure that modifications to one subsystem do not trigger unintended side effects in adjacent components.
2. **Deterministic Contracts:** Given identical inputs, operations within {clean_topic} guarantee predictable, repeatable outputs.
3. **Boundary Verification:** Defensive pre-condition checks prevent corrupted or malformed payloads from entering internal execution pipelines.

---

## 💻 Layer 3: Practical Implementation Walkthrough

```{code_lang}
{code_example}
```

---

## ⚠️ Layer 4: Common Exam & Practical Traps
1. **Ignoring Boundary Null States:** Neglecting empty, null, or zero boundary values.
2. **Coupling Implementation to Abstraction:** Over-relying on concrete implementation details rather than generic contracts.
3. **Neglecting Edge-Case Exceptions:** Forgetting to handle edge-case exceptions gracefully.

---

## 🧠 Layer 5: Active Recall Self-Test
* **Question 1:** What is the primary benefit of modular decomposition in {clean_topic}?
  * *Answer Key:* It reduces cognitive overhead, simplifies unit testing, and isolates bugs to single modules.
* **Question 2:** How should invalid boundary conditions be handled in {clean_topic}?
  * *Answer Key:* Throw informative, explicit exceptions or return structured error results early at boundary entry points.
"""

    return {
        "title": f"{clean_topic} — Multi-Layer Study Master",
        "topic": clean_topic,
        "subject": clean_subj,
        "style": style,
        "topic_tags": [f"{clean_topic} Fundamentals", f"{clean_topic} Implementation"],
        "content": markdown
    }


# =====================================================================
# GEMINI GENERATOR (WITH CNN PRIOR CONTEXT)
# =====================================================================
def generate_notes_with_gemini(topic: str, subject: str, style: str = "Detailed Guide", batch_name: str = "", cnn_meta: dict = None) -> dict:
    """Uses Gemini API to synthesize multi-layered study notes with CNN prior hints."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        prompt = f"""
You are an expert university professor and master tutor.
Create an easy-to-understand, in-depth, multi-layered study master note for students.

Topic: {topic}
Discipline / Language: {subject or 'Computer Science'}
Target Cohort: {batch_name or 'Academic Cohort'}
Deep CNN Classification Category: {cnn_meta.get('category') if cnn_meta else 'General'}

CRITICAL GUIDELINES:
1. Provide a relatable, clear, intuitive everyday analogy in Layer 1. DO NOT use generic repeated templates. If the topic is 'methods in Java', use an intuitive machine/blender analogy. If it is 'OOP', explain Classes vs Objects and the 4 Pillars.
2. The code in Layer 4 MUST be written in the exact requested language ({subject or 'Java'})! If Java, write authentic Java code with classes, methods, and correct types.
3. Cover 7 distinct layers:
   - # Layer 1: Executive Mental Model & Intuitive Analogy
   - # Layer 2: Theoretical Foundations & Principles
   - # Layer 3: System Architecture Blueprint
   - # Layer 4: Real-World Implementation & Code Walkthrough (in {subject})
   - # Layer 5: Edge Cases & Common Exam Traps
   - # Layer 6: Active Recall Knowledge Check (3 Questions with Answer Keys)
   - # Layer 7: Memory Anchors & Mnemonics

Output clean, beautifully formatted Markdown text.
"""
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        text = response.text.strip() if response and response.text else ""
        if text:
            return {
                "title": f"{topic.strip().title()} — Multi-Layer Study Master",
                "topic": topic.strip().title(),
                "subject": subject or "Computer Science",
                "style": style,
                "topic_tags": [
                    f"{topic.strip().title()} Fundamentals",
                    f"{topic.strip().title()} Architecture",
                    f"{topic.strip().title()} Edge Cases"
                ],
                "content": text
            }
    except Exception as e:
        print(f"[AI Notes Generator] Gemini failed ({e}). Using Deep CNN Knowledge Engine.")

    return None


# =====================================================================
# MAIN ENTRY POINT
# =====================================================================
def generate_notes(topic: str, subject: str = "Computer Science", style: str = "Detailed Guide", batch_name: str = "") -> dict:
    """
    Entry point for generating multi-layered study notes.
    Leverages PyTorch Deep 1D-CNN (Multi-Scale Feature Extractor) to classify
    the exact topic and domain, ensuring authentic, distinct, language-specific notes!
    """
    # 1. Run inference through Deep CNN
    try:
        cnn_meta = classify_topic_with_cnn(topic, subject)
    except Exception as cnn_err:
        print(f"[Deep CNN] Inference error: {cnn_err}")
        cnn_meta = {"category": "general_computing", "confidence": 0.5, "model_architecture": "Deep CNN"}

    # 2. Try Gemini with CNN prior
    gemini_result = generate_notes_with_gemini(topic, subject, style, batch_name, cnn_meta)
    if gemini_result:
        return gemini_result

    # 3. Deep CNN Category-Driven Pedagogical Synthesis
    category = cnn_meta.get("category", "")
    clean_topic_lower = topic.strip().lower()

    if category == "java_methods" or ("method" in clean_topic_lower and "java" in subject.lower()):
        return get_java_methods_notes(topic, style, batch_name, cnn_meta)
    elif category == "java_oop" or ("oop" in clean_topic_lower and "java" in subject.lower()) or "class" in clean_topic_lower:
        return get_java_oop_notes(topic, style, batch_name, cnn_meta)
    elif category == "js_async" or ("async" in clean_topic_lower or "promise" in clean_topic_lower):
        return get_javascript_async_notes(topic, style, batch_name, cnn_meta)
    elif category == "database_normalization" or "normal" in clean_topic_lower:
        return get_database_normalization_notes(topic, style, batch_name, cnn_meta)
    else:
        return generate_adaptive_notes(topic, subject, style, batch_name, cnn_meta)
