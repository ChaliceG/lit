# Welcome to Lit

Lit is a small experimental language made to explore a simple idea:
  
### What if functions can only take and return data and never behavior?

This may seem like a simple concept, but it has a radical effect: higher-order functions and classes are behavior and thus cannot be passed to and from functions.  This means Lit is neither functional nor object-oriented, and must devise its own way of managing state not using closures or class instances.

This restriction on functions is not arbitrary.  A similar restriction is in place when designing a web service, which can (usually) only communicate via string messages over a network connection.  The macro question above can then be restated as:
### What if every function call was a service call?  What if every service call was a function call?

There are a few outstanding questions meant to be answered by working on and with the proof of concept in this repository:

- How large is the hit to expressive power from losing closures and instances, and are there other constructs and approaches that do not compromise the only-data restrictions of functions but close this expressiveness gap?  What bread-and-butter language features such as polymorphism can we preserve or port into Lit using these simple functions?
- Given the right language treatment, can one easilly "compose" services with the same power that one can "compose" functions into constructs like monads?
- You can immagine how radically different a runtime might be if every single intermediate result in execution was a simple JSON blob.  Could a debugger in Lit report every single intermediate result?  Could you "replay" execution by "replaying" the JSON results?
- What does an only data type system look like?  Can we create a more expressive or easier to use type system when we only have to express data?
- How does concurrency work?  Is it easier?






