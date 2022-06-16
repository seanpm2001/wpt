function waitFor(condition) {
  const MAX_FRAME = 500;
  return new Promise((resolve, reject) => {
    function tick(frames) {
      // We requestAnimationFrame either for 500 frames or until condition is
      // met.
      if (frames >= MAX_FRAME)
        reject("Condition did not become true after 500 frames");
      else if (condition())
        resolve();
      else
        requestAnimationFrame(tick.bind(this, frames + 1));
    }
    tick(0);
  });
}

function waitForCompositorCommit() {
  return new Promise((resolve) => {
    // rAF twice.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve);
    });
  });
}

function injectInput(touchDiv) {
  return new test_driver.Actions()
    .addPointer("touch_pointer", "touch")
    .pointerMove(0, 0, {origin: touchDiv})
    .pointerDown()
    .pointerMove(30, 30)
    .pointerUp()
    .send();
}

function runTest({target, eventName, expectCancelable}) {
  let touchDiv = document.getElementById("touchDiv");
  let cancelable = null;
  let arrived = 0;
  target.addEventListener(eventName, function (event) {
    cancelable = event.cancelable;
    arrived = true;
    event.preventDefault();
  });
  promise_test (async () => {
    await waitForCompositorCommit();
    await injectInput(touchDiv);
    await waitFor(()=> { return arrived; });
    assert_equals(cancelable, expectCancelable);
  });
}
