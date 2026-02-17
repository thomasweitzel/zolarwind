+++
date = 2019-03-16
title = "Tail Recursion with Trampoline"
description = "Node.js does not support tail call optimization, but a trampoline has the same effect."
authors = ["Thomas Weitzel"]
[taxonomies]
tags = ["javascript"]
[extra]
math = true
image = "banner.webp"
+++

In case your platform lacks support for proper tail call optimization, and you want to do functional programming, you might run into stack space problems.
This can be mitigated, but you have to find a way yourself to make it work.
The specific platform I'm writing about here is [Node.js](https://nodejs.org/en/about).
After a little introduction, I show one well-known solution to the problem.

In functional programming, recursion is a fundamental concept to handle mutability.
Pure functional languages like Haskell do not allow mutation of variables, so you have to come up with a different solution to the problem.
What you do is called [update as you copy](https://alvinalexander.com/scala/functional-programming-simplified-book).
You create new variables by calculating their values from the values of existing ones.
But you never assign a new value to a variable that already has one. 

## Recursion

To simplify the reasoning, I will assume that a function does not rely on or modify external state, i.e. values of variables outside of its body.
Math is organized this way: `1 + 2 = 3` independently of e.g. the current weather outside.
It's always true, no matter what.

In order to write a useful recursive function, you have to make sure that it:

* eventually returns with a value (terminates)
* calls itself

By using these criteria for a recursive function, you can see that it has to either call itself or terminate.
When it terminates, it's done, and you have a value.
Otherwise, it will call itself, and you get another stack frame with this call.
Depending on the number of calls this function makes to itself, the used stack space grows, and you might eventually run out of stack space.
This is not a good thing!

## Tail recursion

What if you do not need the current stack frame anymore, once you make your recursive call?
You could immediately forget it, throw it away, or reuse it, thereby saving stack space.
But you have to make sure that you need no information from this stack frame once you have made your next call.
This can be accomplished by returning the recursive call alone, not adding to it or modifying it once it returns, so the return value can be directly passed on.
Now you have what's called a tail-recursive function.

## Tail call optimization

Once you have made sure that your function is tail-recursive, your runtime environment or compiler can optimize the calls in such a way,
that the existing stack frame is reused by the next call.
The stack thereby never grows, and you have eliminated the potential for a stack overflow.
But it's not enough that it can be optimized, it has to be actually done.
And that's where the problem starts.

Not every runtime environment or compiler performs tail call optimization.
As of this writing two of the platforms that I use do not support tail call optimization out-of-the-box:

* [Node.js](https://nodejs.org/en)
* Java Virtual Machine (JVM) with [Java 8](https://openjdk.java.net/projects/jdk8u)

The JVM does support tail call optimization when used with Kotlin or Scala though.

Not all is lost: were tail call optimization is not directly supported you can implement a workaround that is straight forward.
It's effective in saving you from stack overflow errors.
The rest of this article shows you how to implement it.
It's known under the name [trampoline device](https://en.wikipedia.org/wiki/Tail_call#Through_trampolining).

I use the factorial function and implement it in different ways, starting with a loop that mutates values.
Factorial is defined for natural numbers without the 0 (1, 2, 3, ...).
`Factorial(n)` calculates the product of all numbers between `1` and `n`.
It serves as an example that I chose because it's easy to understand. 
I'll then transform it to a recursive function and show you how to make this function tail-recursive.
Afterwards I introduce the trampoline device and apply it to a function that is the modified tail-recursive function.
Let's start.

## Loop

If you're an [imperative programmer](https://en.wikipedia.org/wiki/Imperative_programming) you would implement the factorial function with a loop.
You start with a variable `result` that has the value `1` and then have a for-loop that starts at `2` and goes up to `n`.
In the body of the for-loop you modify `result` and set it to a value that was its previous value multiplied by whatever value your loop-variable has.
If you are done with the loop you return the `result`.

```js
const loopFactorial = (n) => {
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
};
```

Something to note here is that your `result` variable does not contain the result.
It holds the result only when the execution reaches the return statement.
How do you effectively name a variable that has different meanings during its life cycle?

## Recursive with info left on the stack

How do you slice a carrot?
Although there are many possible ways to do it, one would be to cut off one slice from one end and then repeat the procedure with the rest of the carrot, until there's nothing left.
You do the same with whatever is left until you reach the terminating condition.
It's a recursive definition.
And it's essentially what you do to calculate the factorial in a recursive way.

To calculate the factorial of `n` you multiply `n` with the factorial of `n - 1`.
You now have to calculate the factorial of `n - 1`.
And so on.

```js
const stackFactorial = (n) => {
  if (n > 1) return n * stackFactorial(n - 1);
  return 1;
};
```

You need the result of `stackFactorial(n - 1)` before you can return from the function call, because you have to multiply it with `n` before that can happen.
What `n` actually is, is stored in the context of your **current** stack frame.
The next call will have another stack frame, where `n` has another value.
Because you cannot forget the `n` of the current call, the current stack frame has to stay around.

With large `n` this can lead to a situation where you get an error and the entire process stops: `RangeError: Maximum call stack size exceeded`.

## Recursive without info left on the stack

What can be done about it?
As a first step, you can eliminate the need for the current stack frame once you made the next call.
But you somehow have to preserve information that's needed.
The solution is to pass all required information on to the next recursive call.

An extra parameter is needed to hold this information.
It's commonly called an aggregator, or `agg` for short.
For multiplication, you start at `1` (identity, `n * 1 === n` and `1 * n === n`).
Along the way, you multiply the aggregator with the current value of `n`, thereby keeping track of how far you've come with the product.
The aggregator will look like this over time:

* `1`
* `1 * n`
* `1 * n * (n - 1)`
* `1 * n * (n - 1) * (n - 2)`
* etc.

When you finally hit `1` for `n`, you simply return the aggregator, because it already contains the correct result.

```js
const tailFactorial = (n, agg = 1) => {
  if (n > 1) return tailFactorial(n - 1, agg * n);
  return agg;
};
```

As you can see, the call `tailFactorial(...)` is directly returned, no information from the current stack frame is required anymore.

## Alternative function signature

Even though you invoke `tailFactorial(5)`, the definition has two parameters, `n` and `agg`.
The aggregator has a default value, so you need not provide it.
But since it's exposed in the function's interface, someone can call `tailFactorial(5, 0)` and get a wrong result.
Because nobody should mess with `agg`, it's better to hide it.

Wrap it with a function that only allows the parameter `n` and make it an inner function of that wrapper function.
Within that wrapper function, pass the call on to the inner function.

```js
// Alternative way (not exposing the aggregator)
const tailFactorialAlt = (n) => {
  const innerTailFactorial = (x, agg = 1) => {
    if (x > 1) return innerTailFactorial(x - 1, agg * x);
    return agg;
  };

  return innerTailFactorial(n);
};
```

I will not use this alternative function signature, because it's too verbose and not helping me make my point.
Still, I highly recommend that you do not expose parameters in your function interface that are neither needed nor intended for public access. 

## Returning a function without calling it

Instead of having the tail-recursive function make the tail call itself, it returns a function (with no arguments) that can call the recursive function with all arguments already in place.
This is called a [thunk](https://en.wikipedia.org/wiki/Thunk#Functional_programming).
You then simply have someone to call that thunk, because the tail call is no longer made by the function.
If that's returning another function, you call it again. And again.
Until the final value is returned.

```js
const thunkFactorial = (n, agg = 1) => {
  if (n > 1) return () => thunkFactorial(n - 1, agg * n);
  return agg;
};
```

Since the function returns either a value or another function without calling it, it is neither recursive nor tail-recursive anymore.
The stack cannot grow, and you will not run out of it.
But if your first call does not give you the final result, you end up with just another function and not with the result.

## Device for pulling out functions and calling them

Since you simply pull functions/thunks out of your factorial function until the final value is returned (instead of yet another function), you have to set up a device that's doing just that.
The device is called a trampoline, and it is handed a function that returns either thunks or a final value.
If a call to that function results in another function, it is called for as long as the returned type is a function.
Otherwise, it returns the final result.

```js
const trampoline = fn => (...args) => {
  let res = fn(...args);
  while (res instanceof Function) res = res();
  return res;
};
```

## Putting it into action

You have two things right now, a function that is returning thunks and another function that can call these thunks for as long as needed, i.e. the final result is returned.
The last thing that's left to do is to join these two functions together.

```js
const trampolineFactorial = trampoline(thunkFactorial);

// Example call
trampolineFactorial(5);
```

All this is for Node.js and JavaScript.

## Tail recursive Fibonacci numbers

The Fibonacci sequence is defined like this: `F(0) = 0` and `F(1) = 1`.
For all `n > 1` you calculate them with `F(n) = F(n - 1) + F(n - 2)`.
This is a recursive definition.

What is different from the factorial example used above?
You need two independent information, the two previous values of the function.
When you want to solve the problem with tail recursion, instead of one aggregator parameter, you need to pass two aggregator parameters to the function: the two previous values.
As a rule, you need an additional parameter for every additional information that you need in the body of your function.

Interestingly, `n` is used as a counter, going down to `1`, but the function works its way up to the higher values.
For each call, the `previous` value becomes the `current` value from the previous call, while the `current` value is set to `current + previous`.
Until the function terminates for `n === 1`.

```js
const F = (n, previous = 0, current = 1) => {
  if (n === 0) return previous;
  if (n === 1) return current;
  return F(n - 1, current, current + previous);
};
```

You can wrap it in a function with only one parameter for `n`, which hides the aggregators `current` and `next` if you want.
Like in the example above, the original function becomes an inner function of the wrapper function.

As I recently found out, Fibonacci numbers also have a [closed-form expression](https://en.wikipedia.org/wiki/Fibonacci_number#Matrix_form):

{% katex() %}
F_{n}={\cfrac {1}{\sqrt {5}}}\left({\cfrac {1+{\sqrt {5}}}{2}}\right)^{n}-{\cfrac {1}{\sqrt {5}}}\left({\cfrac {1-{\sqrt {5}}}{2}}\right)^{n}
{% end %}

As an aside: we were [estimating story points](https://www.mountaingoatsoftware.com/agile/planning-poker) during a sprint planing.
Story points roughly follow the Fibonacci numbers, so it's natural that the topic pops up from time to time.
Someone was asking if there was a closed-form expression for Fibonacci numbers, so we searched for an answer. And voilà ...

Using the trampoline device together with the modified tail-recursive Fibonacci function is left as an exercise for the reader.
Hint: you have to modify the tail-recursive Fibonacci function to return a function/thunk instead of returning the result of a recursive function call.

## Final thoughts

I use the trampoline device because Node.js does not support tail call optimization (TCO).
At one point I thought that Node.js would eventually support TCO through its use of Google's V8 engine. Google was actively working on supporting TCO in V8.
But it turned out that Google is [no longer pursuing](https://www.chromestatus.com/feature/5516876633341952) this path.
Since tail-recursive functions are particularly useful in functional programming, it's extremely frustrating to see so little progress.
