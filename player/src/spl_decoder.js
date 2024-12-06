
var SPLDecoder = (() => {
  var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;
  
  return (
function(moduleArg = {}) {
  var moduleRtn;

// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(moduleArg) => Promise<Module>
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = moduleArg;

// Set up the promise that indicates the Module is initialized
var readyPromiseResolve, readyPromiseReject;
var readyPromise = new Promise((resolve, reject) => {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});
["_memory","___indirect_function_table","onRuntimeInitialized"].forEach((prop) => {
  if (!Object.getOwnPropertyDescriptor(readyPromise, prop)) {
    Object.defineProperty(readyPromise, prop, {
      get: () => abort('You are getting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
      set: () => abort('You are setting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
    });
  }
});

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = true;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)


// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var readAsync, readBinary;

if (ENVIRONMENT_IS_SHELL) {

  if ((typeof process == 'object' && typeof require === 'function') || typeof window == 'object' || typeof WorkerGlobalScope != 'undefined') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // When MODULARIZE, this JS may be executed later, after document.currentScript
  // is gone, so we saved it, and we use it here instead of any other info.
  if (_scriptName) {
    scriptDirectory = _scriptName;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.startsWith('blob:')) {
    scriptDirectory = '';
  } else {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/')+1);
  }

  if (!(typeof window == 'object' || typeof WorkerGlobalScope != 'undefined')) throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  {
// include: web_or_worker_shell_read.js
readAsync = (url) => {
    assert(!isFileURI(url), "readAsync does not work with file:// URLs");
    return fetch(url, { credentials: 'same-origin' })
      .then((response) => {
        if (response.ok) {
          return response.arrayBuffer();
        }
        return Promise.reject(new Error(response.status + ' : ' + response.url));
      })
  };
// end include: web_or_worker_shell_read.js
  }
} else
{
  throw new Error('environment detection error');
}

var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.error.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used.
moduleOverrides = null;
checkIncomingModuleAPI();

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];legacyModuleProp('arguments', 'arguments_');

if (Module['thisProgram']) thisProgram = Module['thisProgram'];legacyModuleProp('thisProgram', 'thisProgram');

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] == 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] == 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] == 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] == 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] == 'undefined', 'Module.read option was removed');
assert(typeof Module['readAsync'] == 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] == 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] == 'undefined', 'Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)');
assert(typeof Module['TOTAL_MEMORY'] == 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
legacyModuleProp('asm', 'wasmExports');
legacyModuleProp('readAsync', 'readAsync');
legacyModuleProp('readBinary', 'readBinary');
legacyModuleProp('setWindowTitle', 'setWindowTitle');
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var FETCHFS = 'FETCHFS is no longer included by default; build with -lfetchfs.js';
var ICASEFS = 'ICASEFS is no longer included by default; build with -licasefs.js';
var JSFILEFS = 'JSFILEFS is no longer included by default; build with -ljsfilefs.js';
var OPFS = 'OPFS is no longer included by default; build with -lopfs.js';

var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';

assert(!ENVIRONMENT_IS_WORKER, 'worker environment detected but not enabled at build time.  Add `worker` to `-sENVIRONMENT` to enable.');

assert(!ENVIRONMENT_IS_NODE, 'node environment detected but not enabled at build time.  Add `node` to `-sENVIRONMENT` to enable.');

assert(!ENVIRONMENT_IS_SHELL, 'shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.');

// end include: shell.js

// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary = Module['wasmBinary'];legacyModuleProp('wasmBinary', 'wasmBinary');

if (typeof WebAssembly != 'object') {
  err('no native wasm support detected');
}

// include: base64Utils.js
// Converts a string of base64 into a byte array (Uint8Array).
function intArrayFromBase64(s) {

  var decoded = atob(s);
  var bytes = new Uint8Array(decoded.length);
  for (var i = 0 ; i < decoded.length ; ++i) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}
// end include: base64Utils.js
// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed' + (text ? ': ' + text : ''));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.

// Memory management

var HEAP,
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/** @type {!Float64Array} */
  HEAPF64;

// include: runtime_shared.js
function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module['HEAP8'] = HEAP8 = new Int8Array(b);
  Module['HEAP16'] = HEAP16 = new Int16Array(b);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
  Module['HEAP32'] = HEAP32 = new Int32Array(b);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
}

// end include: runtime_shared.js
assert(!Module['STACK_SIZE'], 'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time')

assert(typeof Int32Array != 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined,
       'JS engine does not provide full typed array support');

// If memory is defined in wasm, the user can't provide it, or set INITIAL_MEMORY
assert(!Module['wasmMemory'], 'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally');
assert(!Module['INITIAL_MEMORY'], 'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically');

// include: runtime_stack_check.js
// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // If the stack ends at address zero we write our cookies 4 bytes into the
  // stack.  This prevents interference with SAFE_HEAP and ASAN which also
  // monitor writes to address zero.
  if (max == 0) {
    max += 4;
  }
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  HEAPU32[((max)>>2)] = 0x02135467;
  HEAPU32[(((max)+(4))>>2)] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAPU32[((0)>>2)] = 1668509029;
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  // See writeStackCookie().
  if (max == 0) {
    max += 4;
  }
  var cookie1 = HEAPU32[((max)>>2)];
  var cookie2 = HEAPU32[(((max)+(4))>>2)];
  if (cookie1 != 0x02135467 || cookie2 != 0x89BACDFE) {
    abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
  }
  // Also test the global address 0 for integrity.
  if (HEAPU32[((0)>>2)] != 0x63736d65 /* 'emsc' */) {
    abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
  }
}
// end include: runtime_stack_check.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;

  checkStackCookie();

  
if (!Module['noFSInit'] && !FS.initialized)
  FS.init();
FS.ignorePermissions = false;

TTY.init();
  callRuntimeCallbacks(__ATINIT__);
}

function postRun() {
  checkStackCookie();

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;

  Module['monitorRunDependencies']?.(runDependencies);

  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(() => {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err(`dependency: ${dep}`);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;

  Module['monitorRunDependencies']?.(runDependencies);

  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

/** @param {string|number=} what */
function abort(what) {
  Module['onAbort']?.(what);

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // definition for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// include: URIUtils.js
// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */
var isDataURI = (filename) => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */
var isFileURI = (filename) => filename.startsWith('file://');
// end include: URIUtils.js
function createExportWrapper(name, nargs) {
  return (...args) => {
    assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
    var f = wasmExports[name];
    assert(f, `exported native function \`${name}\` not found`);
    // Only assert for too many arguments. Too few can be valid since the missing arguments will be zero filled.
    assert(args.length <= nargs, `native function \`${name}\` called with ${args.length} args but expects ${nargs}`);
    return f(...args);
  };
}

// include: runtime_exceptions.js
// end include: runtime_exceptions.js
function findWasmBinary() {
    var f = 'data:application/octet-stream;base64,AGFzbQEAAAABxgRIYAF/AX9gAn9/AX9gAn9/AGADf39/AX9gAX8AYAABf2ADf39/AGAGf39/f39/AX9gAABgBH9/f38AYAV/f39/fwF/YAZ/f39/f38AYAR/f39/AX9gCH9/f39/f39/AX9gBX9/f39/AGAHf39/f39/fwBgB39/f39/f38Bf2AFf35+fn4AYAp/f39/f39/f39/AGADf35/AX5gAAF+YAV/f39/fgF/YAF/AX5gBH9/f38BfmAGf39/f35/AX9gB39/f39/fn4Bf2ACf38BfWAFf39+f38AYAR/fn5/AGAKf39/f39/f39/fwF/YAZ/f39/fn4Bf2ADf35/AX9gBH5+fn4Bf2ACfH8BfGAEf39/fgF+YAZ/fH9/f38Bf2ACfn8Bf2ADf39/AX5gAn9/AXxgA39/fwF9YAN/f38BfGAMf39/f39/f39/f39/AX9gBX9/f398AX9gBn9/f398fwF/YAd/f39/fn5/AX9gC39/f39/f39/f39/AX9gD39/f39/f39/f39/f39/fwBgCH9/f39/f39/AGANf39/f39/f39/f39/fwBgA39/fQBgAX8BfWABfQF9YAJ/fgF/YAJ/fgBgAn99AGACf3wAYAJ+fgF/YAN/fn4AYAJ/fwF+YAJ+fgF9YAJ+fgF8YAN/f34AYAN+f38Bf2ABfAF+YAJ+fwF+YAR/f35/AX5gBn9/f35/fwBgBn9/f39/fgF/YAh/f39/f39+fgF/YAl/f39/f39/f38Bf2AFf39/fn4AYAR/fn9/AX8CvAcgA2VudgtfX2N4YV90aHJvdwAGA2VudhFfZW12YWxfdGFrZV92YWx1ZQABA2VudhZfZW1iaW5kX3JlZ2lzdGVyX2NsYXNzADADZW52FV9lbWJpbmRfcmVnaXN0ZXJfdm9pZAACA2VudhVfZW1iaW5kX3JlZ2lzdGVyX2Jvb2wACQNlbnYYX2VtYmluZF9yZWdpc3Rlcl9pbnRlZ2VyAA4DZW52Fl9lbWJpbmRfcmVnaXN0ZXJfZmxvYXQABgNlbnYbX2VtYmluZF9yZWdpc3Rlcl9zdGRfc3RyaW5nAAIDZW52HF9lbWJpbmRfcmVnaXN0ZXJfc3RkX3dzdHJpbmcABgNlbnYWX2VtYmluZF9yZWdpc3Rlcl9lbXZhbAAEA2VudhxfZW1iaW5kX3JlZ2lzdGVyX21lbW9yeV92aWV3AAYDZW52HV9lbWJpbmRfcmVnaXN0ZXJfdmFsdWVfb2JqZWN0AAsDZW52I19lbWJpbmRfcmVnaXN0ZXJfdmFsdWVfb2JqZWN0X2ZpZWxkABIDZW52HV9lbWJpbmRfZmluYWxpemVfdmFsdWVfb2JqZWN0AAQDZW52Il9lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfY29uc3RydWN0b3IACwNlbnYfX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19mdW5jdGlvbgASA2Vudg1fZW12YWxfZGVjcmVmAAQDZW52FV9lbXNjcmlwdGVuX21lbWNweV9qcwAGA2VudhZlbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwAAADZW52EF9fc3lzY2FsbF9vcGVuYXQADANlbnYRX19zeXNjYWxsX2ZjbnRsNjQAAwNlbnYPX19zeXNjYWxsX2lvY3RsAAMWd2FzaV9zbmFwc2hvdF9wcmV2aWV3MQhmZF93cml0ZQAMFndhc2lfc25hcHNob3RfcHJldmlldzEHZmRfcmVhZAAMFndhc2lfc25hcHNob3RfcHJldmlldzEIZmRfY2xvc2UAAANlbnYJX2Fib3J0X2pzAAgWd2FzaV9zbmFwc2hvdF9wcmV2aWV3MRFlbnZpcm9uX3NpemVzX2dldAABFndhc2lfc25hcHNob3RfcHJldmlldzELZW52aXJvbl9nZXQAAQNlbnYJX3R6c2V0X2pzAAkDZW52DV9fYXNzZXJ0X2ZhaWwACQNlbnYXX2VtYmluZF9yZWdpc3Rlcl9iaWdpbnQADxZ3YXNpX3NuYXBzaG90X3ByZXZpZXcxB2ZkX3NlZWsACgO2DrQOCAAECAgBAwEAAAMDAgECBgYBAwEFAAEIAAgBAAEDAwAIAAUFBAUFBQUFBQUABAICAAUEBQUBBgUFAAUaMQUFAAUABQAABTIzBQAFBQUBAQAABQIABQIDAwAAAAABAAIAAAQAAAAAAAEAAAAAAAUDAAAFAAAABQAAAAACAAIFAAAAAAAAAAICBAUACAUDBQUFCAMAAAUAAwQBAQEDAgUABQUBAQAAABMTAwMAAAEAAAEABAQFCAABAQAEHx8DAAQAAwAMCAADDBYWAAQABAACAxs0CQAAAwEDAgABAwAFAAABAwEBAAAEBAMAAAAAAAEAAQAD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Y2tfZ2V0X2ZyZWUAwg4ZZW1zY3JpcHRlbl9zdGFja19nZXRfYmFzZQDDDhhlbXNjcmlwdGVuX3N0YWNrX2dldF9lbmQAxA4ZX2Vtc2NyaXB0ZW5fc3RhY2tfcmVzdG9yZQDFDhdfZW1zY3JpcHRlbl9zdGFja19hbGxvYwDGDhxlbXNjcmlwdGVuX3N0YWNrX2dldF9jdXJyZW50AMcODGR5bkNhbGxfamlqaQDNDg5keW5DYWxsX3ZpaWppaQDODg5keW5DYWxsX2lpaWlpagDPDg9keW5DYWxsX2lpaWlpamoA0A4QZHluQ2FsbF9paWlpaWlqagDRDgm4BQEAQQEL4QIjtg45QURMLi9RUlVWW1wlbocBjgHHAcgByQHLAd8B6wHsAe4B7wHwAfIB8wH0AfUB/AH+AYACgQKCAoQChgKFAocC7QLyAosDgAODA4YDiAP2AvwC/QLpAeoBKIwDO40DiQSKBLkE0wTUBNcEtwHCB9kJ7wn3CYQK8gr1CvkK/Ar/CoILhAuGC4gLiguMC44LkAuSC+QJ6AmACpUKlgqXCpgKmQqaCpsKnAqdCp4K6QioCqkKrAqvCrAKswq0CrYK3QreCuEK4wrlCucK6wrfCuAK4grkCuYK6ArsCooF/wmFCoYKhwqICokKigqMCo0KjwqQCpEKkgqTCp8KoAqhCqIKowqkCqUKpgq3CrgKugq8Cr0Kvgq/CsEKwgrDCsQKxQrGCscKyArJCsoKywrNCs8K0ArRCtIK1ArVCtYK1wrYCtkK2grbCtwKiQWLBYwFjQWQBZEFkgWTBZQFmAWVC5kFpwWwBbMFtgW5BbwFvwXEBccFygWWC9EF2wXgBeIF5AXmBegF6gXuBfAF8gWXC4MGiwaSBpQGlgaYBqEGowaYC6cGsAa0BrYGuAa6BsAGwgaZC5sLywbMBs0GzgbQBtIG1QbwCvcK/QqLC48LgwuHC5wLngvkBuUG5gbsBu4G8AbzBvMK+gqAC40LkQuFC4kLoAufC4AHoguhC4YHowuMB48HkAeRB5IHkweUB5UHlgekC5cHmAeZB5oHmwecB50HngefB6ULoAejB6QHpQepB6oHqwesB60HpguuB68HsAexB7IHswe0B7UHtgenC8EH2QeoC4EIkwipC8EIzQiqC84I2wirC+MI5AjlCKwL5gjnCOgIyw3MDY0Ojg6R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AgQgACAEIAUgBmtqNgIIAkAgACgCMEUNACAAIARBAWo2AgQgASACakF/aiAELQAAOgAACyACIQQLIANBIGokACAECwQAIAALDwAgACgCPBDKARAYEMUBCwQAQQALBABBAAsEAEEACwQAQQALBABBAAsCAAsCAAsNAEG0lwUQ0QFBuJcFCwkAQbSXBRDSAQsuAQJ/IAAQ0wEiASgCACICNgI4AkAgAkUNACACIAA2AjQLIAEgADYCABDUASAAC8gCAQJ/IwBBIGsiAiQAAkACQAJAAkBBu4YEIAEsAAAQwgENABC0AUEcNgIADAELQZgJELUBIgMNAQtBACEDDAELIANBAEGQARCsARoCQCABQSsQwgENACADQQhBBCABLQAAQfIARhs2AgALAkACQCABLQAAQeEARg0AIAMoAgAhAQwBCwJAIABBA0EAEBQiAUGACHENACACIAFBgAhyrDcDECAAQQQgAkEQahAUGgsgAyADKAIAQYABciIBNgIACyADQX82AlAgA0GACDYCMCADIAA2AjwgAyADQZgBajYCLAJAIAFBCHENACACIAJBGGqtNwMAIABBk6gBIAIQFQ0AIANBCjYCUAsgA0ETNgIoIANBFDYCJCADQRU2AiAgA0EWNgIMAkBBAC0AhZIFDQAgA0F/NgJMCyADENUBIQMLIAJBIGokACADC3gBA38jAEEQayICJAACQAJAAkBBu4YEIAEsAAAQwgENABC0AUEcNgIADAELIAEQwwEhAyACQrYDNwMAQQAhBEGcfyAAIANBgIACciACEBMQxAEiAEEASA0BIAAgARDWASIEDQEgABAYGgtBACEECyACQRBqJAAgBAsEAEEBCwIAC54BAQF/AkACQCACQQNJDQAQtAFBHDYCAAwBCwJAIAJBAUcNACAAKAIIIgNFDQAgASADIAAoAgRrrH0hAQsCQCAAKAIUIAAoAhxGDQAgAEEAQQAgACgCJBEDABogACgCFEUNAQsgAEEANgIcIABCADcDECAAIAEgAiAAKAIoERMAQgBTDQAgAEIANwIEIAAgACgCAEFvcTYCAEEADwtBfws8AQF/AkAgACgCTEF/Sg0AIAAgASACENoBDwsgABDYASEDIAAgASACENoBIQICQCADRQ0AIAAQ2QELIAILDAAgACABrCACENsBC8gCAQN/AkAgAA0AQQAhAQJA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IQEgABDnASECAkAgAUUNACAAENkBCyACCwcAIAAQiQQLEAAgABDpARogAEHQABDTDQsWACAAQdCWBDYCACAAQQRqEJoFGiAACw8AIAAQ6wEaIABBIBDTDQsxACAAQdCWBDYCACAAQQRqEPwJGiAAQRhqQgA3AgAgAEEQakIANwIAIABCADcCCCAACwIACwQAIAALCgAgAEJ/EPEBGgsSACAAIAE3AwggAEIANwMAIAALCgAgAEJ/EPEBGgsEAEEACwQAQQALwgEBBH8jAEEQayIDJABBACEEAkADQCACIARMDQECQAJAIAAoAgwiBSAAKAIQIgZPDQAgA0H/////BzYCDCADIAYgBWs2AgggAyACIARrNgIEIANBDGogA0EIaiADQQRqEPYBEPYBIQUgASAAKAIMIAUoAgAiBRD3ARogACAFEPgBDAELIAAgACgCACgCKBEAACIFQX9GDQIgASAFEPkBOgAAQQEhBQsgASAFaiEBIAUgBGohBAwACwALIANBEGokACAECwkAIAAgARD6AQsOACABIAIgABD7ARogAAsPACAAIAAoAgwgAWo2AgwLBQAgAMALKQECfyMAQRBrIgIkACACQQ9qIAEgABCOAyEDIAJBEGokACABIAAgAxsLDgAgACAAIAFqIAIQjwMLBQAQ/QELBABBfws1AQF/AkAgACAAKAIAKAIkEQAAEP0BRw0AEP0BDwsgACAAKAIMIgFBAWo2AgwgASwAABD/AQsIACAAQf8BcQsFABD9AQu9AQEFfyMAQRBrIgMkAEEAIQQQ/QEhBQJAA0AgAiAETA0BAkAgACgCGCIGIAAoAhwiB0kNACAAIAEsAAAQ/wEgACgCACgCNBEBACAFRg0CIARBAWohBCABQQFqIQEMAQsgAyAHIAZrNgIMIAMgAiAEazYCCCADQQxqIANBCGoQ9gEhBiAAKAIYIAEgBigCACIGEPcBGiAAIAYgACgCGGo2AhggBiAEaiEEIAEgBmohAQwACwALIANBEGokACAECwUAEP0BCwQAIAALFgAgAEGwlwQQgwIiAEEIahDpARogAAsTACAAIAAoAgBBdGooAgBqEIQCCw0AIAAQhAJB2AAQ0w0LEwAgACAAKAIAQXRqKAIAahCGAgusAgEDfyMAQRBrIgMkACAAQQA6AAAgASABKAIAQXRqKAIAahCJAiEEIAEg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H3UiA3MgA2siA61CACADZyIDQdEAahCTBCACQQhqKQMAQoCAgICAgMAAhUGegAEgA2utQjCGfCABQYCAgIB4ca1CIIaEIQUgAikDACEECyAAIAQ3AwAgACAFNwMIIAJBEGokAAtTAQF+AkACQCADQcAAcUUNACACIANBQGqtiCEBQgAhAgwBCyADRQ0AIAJBwAAgA2uthiABIAOtIgSIhCEBIAIgBIghAgsgACABNwMAIAAgAjcDCAuaCwIFfw9+IwBB4ABrIgUkACAEQv///////z+DIQogBCAChUKAgICAgICAgIB/gyELIAJC////////P4MiDEIgiCENIARCMIinQf//AXEhBgJAAkACQCACQjCIp0H//wFxIgdBgYB+akGCgH5JDQBBACEIIAZBgYB+akGBgH5LDQELAkAgAVAgAkL///////////8AgyIOQoCAgICAgMD//wBUIA5CgICAgICAwP//AFEbDQAgAkKAgICAgIAghCELDAILAkAgA1AgBEL///////////8AgyICQoCAgICAgMD//wBUIAJCgICAgICAwP//AFEbDQAgBEKAgICAgIAghCELIAMhAQwCCwJAIAEgDkKAgICAgIDA//8AhYRCAFINAAJAIAMgAoRQRQ0AQoCAgICAgOD//wAhC0IAIQEMAwsgC0KAgICAgIDA//8AhCELQgAhAQwCCwJAIAMgAkKAgICAgIDA//8AhYRCAFINACABIA6EIQJCACEBAkAgAlBFDQBCgICAgICA4P//ACELDAMLIAtCgICAgICAwP//AIQhCwwCCwJAIAEgDoRCAFINAEIAIQEMAgsCQCADIAKEQgBSDQBCACEBDAILQQAhCAJAIA5C////////P1YNACAFQdAAaiABIAwgASAMIAxQIggbeSAIQQZ0rXynIghBcWoQkwRBECAIayEIIAVB2ABqKQMAIgxCIIghDSAFKQNQIQELIAJC////////P1YNACAFQcAAaiADIAogAyAKIApQIgkbeSAJQQZ0rXynIglBcWoQkwQgCCAJa0EQaiEIIAVByABqKQMAIQogBSkDQCEDCyADQg+GIg5CgID+/w+DIgIgAUIgiCIEfiIPIA5CIIgiDiABQv////8PgyIBfnwiEEIghiIRIAIgAX58IhIgEVStIAIgDEL/////D4MiDH4iEyAOIAR+fCIRIANCMYggCkIPhiIUhEL/////D4MiAyABfnwiFSAQQiCIIBAgD1StQiCGhHwiECACIA1CgIAEhCIKfiIWIA4gDH58Ig0gFEIgiEKAgICACIQiAiABfnwiDyADIAR+fCIUQiCGfCIXfCEBIAcgBmogCGpBgYB/aiEGAkACQCACIAR+IhggDiAKfnwiBCAYVK0gBCADIAx+fCIOIARUrXwgAiAKfnwgDiARIBNUrSAVIBFUrXx8IgQgDlStfCADIAp+IgMgAiAMfnwiAiADVK1CIIYgAkIgiIR8IAQgAkIghnwiAiAEVK18IAIgFEIgiCANIBZUrSAPIA1UrXwgFCAPVK18QiCGhHwiBCACVK18IAQgECAVVK0gFyAQVK18fCICIARUrXwiBEKAgICAgIDAAINQDQAgBkEBaiEGDAELIBJCP4ghAyAEQgGGIAJCP4iEIQQgAkIBhiABQj+IhCECIBJCAYYhEiADIAFCAYaEIQELAkAgBkH//wFIDQAgC0KAgICAgIDA//8AhCELQgAhAQwBCwJAAkAgBkEASg0AAkBBASAGayIHQf8ASw0AIAVBMGogEiABIAZB/wBqIgYQkwQgBUEgaiACIAQgBhCTBCAFQRBqIBIgASAHEJYEIAUgAiAEIAcQlgQgBSkDICAFKQMQhCAFKQMwIAVBMGpBCGopAwCEQgBSrYQhEiAFQSBqQQhqKQMAIAVBEGpBCGopAwCEIQEgBUEIaikDACEEIAUpAwAhAgwCC0IAIQEMAgsgBq1CMIYgBEL///////8/g4QhBAsgBCALhCELAkAgElAgAUJ/VSABQoCAgICAgICAgH9RGw0AIAsgAkIBfCIBUK18IQsMAQsCQCASIAFCgICAgICAgICAf4WEQgBRDQAgAiEBDAELIAsgAiACQgGDfCIBIAJUrXwhCwsgACABNwMAIAAgCzcDCCAFQeAAaiQACwQAQQALBABBAAvqCgIEfwR+IwBB8ABrIgUkACAEQv///////////wCDIQkCQAJAAkAgAVAiBiACQv///////////wCDIgpCgICAgICAwICAf3xCgICAgICAwICAf1QgClAbDQAgA0IAUiAJQoCAgICAgMCAgH98IgtCgICAgICAwICAf1YgC0KAgICAgIDAgIB/URsNAQsCQCAGIApCgICAgICAwP//AFQgCkKAgICAgIDA//8AURsNACACQoCAgICAgCCEIQQgASEDDAILAkAgA1AgCUKAgICAgIDA//8AVCAJQoCAgICAgMD//wBRGw0AIARCgICAgICAIIQhBAwCCwJAIAEgCkKAgICAgIDA//8AhYRCAFINAEKAgICAgIDg//8AIAIgAyABhSAEIAKFQoCAgICAgICAgH+FhFAiBhshBEIAIAEgBhshAwwCCyADIAlCgICAgICAwP//AIWEUA0BAkAgASAKhEIAUg0AIAMgCYRCAFINAiADIAGDIQMgBCACgyEEDAILIAMgCYRQRQ0AIAEhAyACIQQMAQsgAyABIAMgAVYgCSAKViAJIApRGyIHGyEJIAQgAiAHGyILQv///////z+DIQogAiAEIAcbIgxCMIinQf//AXEhCAJAIAtCMIinQf//AXEiBg0AIAVB4ABqIAkgCiAJIAogClAiBht5IAZBBnStfKciBkFxahCTBEEQIAZrIQYgBUHoAGopAwAhCiAFKQNgIQkLIAEgAyAHGyEDIAxC////////P4MhAQJAIAgNACAFQdAAaiADIAEgAyABIAFQIgcbeSAHQQZ0rXynIgdBcWoQkwRBECAHayEIIAVB2ABqKQMAIQEgBSkDUCEDCyABQgOGIANCPYiEQoCAgICAgIAEhCEBIApCA4YgCUI9iIQhDCADQgOGIQogBCAChSEDAkAgBiAIRg0AAkAgBiAIayIHQf8ATQ0AQgAhAUIBIQoMAQsgBUHAAGogCiABQYABIAdrEJMEIAVBMGogCiABIAcQlgQgBSkDMCAFKQNAIAVBwABqQQhqKQMAhEIAUq2EIQogBUEwakEIaikDACEBCyAMQoCAgICAgIAEhCEMIAlCA4YhCQJAAkAgA0J/VQ0AQgAhA0IAIQQgCSAKhSAMIAGFhFANAiAJIAp9IQIgDCABfSAJIApUrX0iBEL/////////A1YNASAFQSBqIAIgBCACIAQgBFAiBxt5IAdBBnStfKdBdGoiBxCTBCAGIAdrIQYgBUEoaikDACEEIAUpAyAhAgwBCyABIAx8IAogCXwiAiAKVK18IgRCgICAgICAgAiDUA0AIAJCAYggBEI/hoQgCkIBg4QhAiAGQQFqIQYgBEIBiCEECyALQoCAgICAgICAgH+DIQoCQCAGQf//AUgNACAKQoCAgICAgMD//wCEIQRCACEDDAELQQAhBwJAAkAgBkEATA0AIAYhBwwBCyAFQRBqIAIgBCAGQf8AahCTBCAFIAIgBEEBIAZrEJYEIAUpAwAgBSkDECAFQRBqQQhqKQMAhEIAUq2EIQIgBUEIaikDACEECyACQgOIIARCPYaEIQMgB61CMIYgBEIDiEL///////8/g4QgCoQhBCACp0EHcSEGAkACQAJAAkACQBCYBA4DAAECAwsCQCAGQQRGDQAgBCADIAZBBEutfCIKIANUrXwhBCAKIQMMAwsgBCADIANCAYN8IgogA1StfCEEIAohAwwDCyAEIAMgCkIAUiAGQQBHca18IgogA1StfCEEIAohAwwBCyAEIAMgClAgBkEAR3GtfCIKIANUrXwhBCAKIQMLIAZFDQELEJkEGgsgACADNwMAIAAgBDcDCCAFQfAAaiQAC/oBAgJ/BH4jAEEQayICJAAgAb0iBEL/////////B4MhBQJAAkAgBEI0iEL/D4MiBlANAAJAIAZC/w9RDQAgBUIEiCEHIAVCPIYhBSAGQoD4AHwhBgwCCyAFQgSIIQcgBUI8hiEFQv//ASEGDAELAkAgBVBFDQBCACEFQgAhB0IAIQYMAQsgAiAFQgAgBKdnQSByIAVCIIinZyAFQoCAgIAQVBsiA0ExahCTBEGM+AAgA2utIQYgAkEIaikDAEKAgICAgIDAAIUhByACKQMAIQULIAAgBTcDACAAIAZCMIYgBEKAgICAgICAgIB/g4QgB4Q3AwggAkEQaiQAC+YBAgF/An5BASEEAkAgAEIAUiABQv///////////wCDIgVCgICAgICAwP//AFYgBUKAgICAgIDA//8AURsNACACQgBSIANC////////////AIMiBkKAgICAgIDA//8AViAGQoCAgICAgMD//wBRGw0AAkAgAiAAhCAGIAWEhFBFDQBBAA8LAkAgAyABg0IAUw0AAkAgACACVCABIANTIAEgA1EbRQ0AQX8PCyAAIAKFIAEgA4WEQgBSDwsCQCAAIAJWIAEgA1UgASADURtFDQBBfw8LIAAgAoUgASADhYRCAFIhBAsgBAvYAQIBfwJ+QX8hBAJAIABCAFIgAUL///////////8AgyIFQoCAgICAgMD//wBWIAVCgICAgICAwP//AFEbDQAgAkIAUiADQv///////////wCDIgZCgICAgICAwP//AFYgBkKAgICAgIDA//8AURsNAAJAIAIgAIQgBiAFhIRQRQ0AQQAPCwJAIAMgAYNCAFMNACAAIAJUIAEgA1MgASADURsNASAAIAKFIAEgA4WEQgBSDwsgACACViABIANVIAEgA1EbDQAgACAChSABIAOFhEIAUiEECyAEC64BAAJAAkAgAUGACEgNACAARAAAAAAAAOB/oiEAAkAgAUH/D08NACABQYF4aiEBDAILIABEAAAAAAAA4H+iIQAgAUH9FyABQf0XSRtBgnBqIQEMAQsgAUGBeEoNACAARAAAAAAAAGADoiEAAkAgAUG4cE0NACABQckHaiEBDAELIABEAAAAAAAAYAOiIQAgAUHwaCABQfBoSxtBkg9qIQELIAAgAUH/B2qtQjSGv6ILPAAgACABNwMAIAAgBEIwiKdBgIACcSACQoCAgICAgMD//wCDQjCIp3KtQjCGIAJC////////P4OENwMIC3UCAX8CfiMAQRBrIgIkAAJAAkAgAQ0AQgAhA0IAIQQMAQsgAiABrUIAQfAAIAFnIgFBH3NrEJMEIAJBCGopAwBCgICAgICAwACFQZ6AASABa61CMIZ8IQQgAikDACEDCyAAIAM3AwAgACAENwMIIAJBEGokAAtIAQF/IwBBEGsiBSQAIAUgASACIAMgBEKAgICAgICAgIB/hRCaBCAFKQMAIQQgACAFQQhqKQMANwMIIAAgBDcDACAFQRBqJAAL5wIBAX8jAEHQAGsiBCQAAkACQCADQYCAAUgNACAEQSBqIAEgAkIAQoCAgICAgID//wAQlwQgBEEgakEIaikDACECIAQpAyAhAQJAIANB//8BTw0AIANBgYB/aiEDDAILIARBEGogASACQgBCgICAgICAgP//ABCXBCADQf3/AiADQf3/AkkbQYKAfmohAyAEQRBqQQhqKQMAIQIgBCkDECEBDAELIANBgYB/Sg0AIARBwABqIAEgAkIAQoCAgICAgIA5EJcEIARBwABqQQhqKQMAIQIgBCkDQCEBAkAgA0H0gH5NDQAgA0GN/wBqIQMMAQsgBEEwaiABIAJCAEKAgICAgICAORCXBCADQeiBfSADQeiBfUsbQZr+AWohAyAEQTBqQQhqKQMAIQIgBCkDMCEBCyAEIAEgAkIAIANB//8Aaq1CMIYQlwQgACAEQQhqKQMANwMIIAAgBCkDADcDACAEQdAAaiQAC3UBAX4gACAEIAF+IAIgA358IANCIIgiAiABQiCIIgR+fCADQv////8PgyIDIAFC/////w+DIgF+IgVCIIggAyAEfnwiA0IgiHwgA0L/////D4MgAiABfnwiAUIgiHw3AwggACABQiCGIAVC/////w+DhDcDAAvnEAIFfw9+IwBB0AJrIgUkACAEQv///////z+DIQogAkL///////8/gyELIAQgAoVCgICAgICAgICAf4MhDCAEQjCIp0H//wFxIQYCQAJAAkAgAkIwiKdB//8BcSIHQYGAfmpBgoB+SQ0AQQAhCCAGQYGAfmpBgYB+Sw0BCwJAIAFQIAJC////////////AIMiDUKAgICAgIDA//8AVCANQoCAgICAgMD//wBRGw0AIAJCgICAgICAIIQhDAwCCwJAIANQIARC////////////AIMiAkKAgICAgIDA//8AVCACQoCAgICAgMD//wBRGw0AIARCgICAgICAIIQhDCADIQEMAgsCQCABIA1CgICAgICAwP//AIWEQgBSDQACQCADIAJCgICAgICAwP//AIWEUEUNAEIAIQFCgICAgICA4P//ACEMDAMLIAxCgICAgICAwP//AIQhDEIAIQEMAgsCQCADIAJCgICAgICAwP//AIWEQgBSDQBCACEBDAILAkAgASANhEIAUg0AQoCAgICAgOD//wAgDCADIAKEUBshDEIAIQEMAgsCQCADIAKEQgBSDQAgDEKAgICAgIDA//8AhCEMQgAhAQwCC0EAIQgCQCANQv///////z9WDQAgBUHAAmogASALIAEgCyALUCIIG3kgCEEGdK18pyIIQXFqEJMEQRAgCGshCCAFQcgCaikDACELIAUpA8ACIQELIAJC////////P1YNACAFQbACaiADIAogAyAKIApQIgkbeSAJQQZ0rXynIglBcWoQkwQgCSAIakFwaiEIIAVBuAJqKQMAIQogBSkDsAIhAwsgBUGgAmogA0IxiCAKQoCAgICAgMAAhCIOQg+GhCICQgBCgICAgLDmvIL1ACACfSIEQgAQowQgBUGQAmpCACAFQaACakEIaikDAH1CACAEQgAQowQgBUGAAmogBSkDkAJCP4ggBUGQAmpBCGopAwBCAYaEIgRCACACQgAQowQgBUHwAWogBEIAQgAgBUGAAmpBCGopAwB9QgAQowQgBUHgAWogBSkD8AFCP4ggBUHwAWpBCGopAwBCAYaEIgRCACACQgAQowQgBUHQAWogBEIAQgAgBUHgAWpBCGopAwB9QgAQowQgBUHAAWogBSkD0AFCP4ggBUHQAWpBCGopAwBCAYaEIgRCACACQgAQowQgBUGwAWogBEIAQgAgBUHAAWpBCGopAwB9QgAQowQgBUGgAWogAkIAIAUpA7ABQj+IIAVBsAFqQQhqKQMAQgGGhEJ/fCIEQgAQowQgBUGQAWogA0IPhkIAIARCABCjBCAFQfAAaiAEQgBCACAFQaABakEIaikDACAFKQOgASIKIAVBkAFqQQhqKQMAfCICIApUrXwgAkIBVq18fUIAEKMEIAVBgAFqQgEgAn1CACAEQgAQowQgCCAHIAZraiEGAkACQCAFKQNwIg9CAYYiECAFKQOAAUI/iCAFQYABakEIaikDACIRQgGGhHwiDUKZk398IhJCIIgiAiALQoCAgICAgMAAhCITQgGGIhRCIIgiBH4iFSABQgGGIhZCIIgiCiAFQfAAakEIaikDAEIBhiAPQj+IhCARQj+IfCANIBBUrXwgEiANVK18Qn98Ig9CIIgiDX58IhAgFVStIBAgD0L/////D4MiDyABQj+IIhcgC0IBhoRC/////w+DIgt+fCIRIBBUrXwgDSAEfnwgDyAEfiIVIAsgDX58IhAgFVStQiCGIBBCIIiEfCARIBBCIIZ8IhAgEVStfCAQIBJC/////w+DIhIgC34iFSACIAp+fCIRIBVUrSARIA8gFkL+////D4MiFX58IhggEVStfHwiESAQVK18IBEgEiAEfiIQIBUgDX58IgQgAiALfnwiCyAPIAp+fCINQiCIIAQgEFStIAsgBFStfCANIAtUrXxCIIaEfCIEIBFUrXwgBCAYIAIgFX4iAiASIAp+fCILQiCIIAsgAlStQiCGhHwiAiAYVK0gAiANQiCGfCACVK18fCICIARUrXwiBEL/////////AFYNACAUIBeEIRMgBUHQAGogAiAEIAMgDhCjBCABQjGGIAVB0ABqQQhqKQMAfSAFKQNQIgFCAFKtfSEKIAZB/v8AaiEGQgAgAX0hCwwBCyAFQeAAaiACQgGIIARCP4aEIgIgBEIBiCIEIAMgDhCjBCABQjCGIAVB4ABqQQhqKQMAfSAFKQNgIgtCAFKtfSEKIAZB//8AaiEGQgAgC30hCyABIRYLAkAgBkH//wFIDQAgDEKAgICAgIDA//8AhCEMQgAhAQwBCwJAAkAgBkEBSA0AIApCAYYgC0I/iIQhASAGrUIwhiAEQv///////z+DhCEKIAtCAYYhBAwBCwJAIAZBj39KDQBCACEBDAILIAVBwABqIAIgBEEBIAZrEJYEIAVBMGogFiATIAZB8ABqEJMEIAVBIGogAyAOIAUpA0AiAiAFQcAAakEIaikDACIKEKMEIAVBMGpBCGopAwAgBUEgakEIaikDAEIBhiAFKQMgIgFCP4iEfSAFKQMwIgQgAUIBhiILVK19IQEgBCALfSEECyAFQRBqIAMgDkIDQgAQowQgBSADIA5CBUIAEKMEIAogAiACQgGDIgsgBHwiBCADViABIAQgC1StfCIBIA5WIAEgDlEbrXwiAyACVK18IgIgAyACQoCAgICAgMD//wBUIAQgBSkDEFYgASAFQRBqQQhqKQMAIgJWIAEgAlEbca18IgIgA1StfCIDIAIgA0KAgICAgIDA//8AVCAEIAUpAwBWIAEgBUEIaikDACIEViABIARRG3GtfCIBIAJUrXwgDIQhDAsgACABNwMAIAAgDDcDCCAFQdACaiQAC0sCAX4CfyABQv///////z+DIQICQAJAIAFCMIinQf//AXEiA0H//wFGDQBBBCEEIAMNAUECQQMgAiAAhFAbDwsgAiAAhFAhBAsgBAvSBgIEfwN+IwBBgAFrIgUkAAJAAkACQCADIARCAEIAEJwERQ0AIAMgBBClBEUNACACQjCIpyIGQf//AXEiB0H//wFHDQELIAVBEGogASACIAMgBBCXBCAFIAUpAxAiBCAFQRBqQQhqKQMAIgMgBCADEKQEIAVBCGopAwAhAiAFKQMAIQQMAQsCQCABIAJC////////////AIMiCSADIARC////////////AIMiChCcBEEASg0AAkAgASAJIAMgChCcBEUNACABIQQMAgsgBUHwAGogASACQgBCABCXBCAFQfgAaikDACECIAUpA3AhBAwBCyAEQjCIp0H//wFxIQgCQAJAIAdFDQAgASEEDAELIAVB4ABqIAEgCUIAQoCAgICAgMC7wAAQlwQgBUHoAGopAwAiCUIwiKdBiH9qIQcgBSkDYCEECwJAIAgNACAFQdAAaiADIApCAEKAgICAgIDAu8AAEJcEIAVB2ABqKQMAIgpCMIinQYh/aiEIIAUpA1AhAwsgCkL///////8/g0KAgICAgIDAAIQhCyAJQv///////z+DQoCAgICAgMAAhCEJAkAgByAITA0AA0ACQAJAIAkgC30gBCADVK19IgpCAFMNAAJAIAogBCADfSIEhEIAUg0AIAVBIGogASACQgBCABCXBCAFQShqKQMAIQIgBSkDICEEDAULIApCAYYgBEI/iIQhCQwBCyAJQgGGIARCP4iEIQkLIARCAYYhBCAHQX9qIgcgCEoNAAsgCCEHCwJAAkAgCSALfSAEIANUrX0iCkIAWQ0AIAkhCgwBCyAKIAQgA30iBIRCAFINACAFQTBqIAEgAkIAQgAQlwQgBUE4aikDACECIAUpAzAhBAwBCwJAIApC////////P1YNAANAIARCP4ghAyAHQX9qIQcgBEIBhiEEIAMgCkIBhoQiCkKAgICAgIDAAFQNAAsLIAZBgIACcSEIAkAgB0EASg0AIAVBwABqIAQgCkL///////8/gyAHQfgAaiAIcq1CMIaEQgBCgICAgICAwMM/EJcEIAVByABqKQMAIQIgBSkDQCEEDAELIApC////////P4MgByAIcq1CMIaEIQILIAAgBDcDACAAIAI3AwggBUGAAWokAAscACAAIAJC////////////AIM3AwggACABNwMAC5cJAgZ/An4jAEEwayIEJABCACEKAkACQCACQQJLDQAgAkECdCICQYycBGooAgAhBSACQYCcBGooAgAhBgNAAkACQCABKAIEIgIgASgCaEYNACABIAJBAWo2AgQgAi0AACECDAELIAEQkgQhAgsgAhCpBA0AC0EBIQcCQAJAIAJBVWoOAwABAAELQX9BASACQS1GGyEHAkAgASgCBCICIAEoAmhGDQAgASACQQFqNgIEIAItAAAhAgwBCyABEJIEIQILQQAhCAJAAkACQCACQV9xQckARw0AA0AgCEEHRg0CAkACQCABKAIEIgIgASgCaEYNACABIAJBAWo2AgQgAi0AACECDAELIAEQkgQhAgsgCEGBgARqIQkgCEEBaiEIIAJBIHIgCSwAAEYNAAsLAkAgCEEDRg0AIAhBCEYNASADRQ0CIAhBBEkNAiAIQQhGDQELAkAgASkDcCIKQgBTDQAgASABKAIEQX9q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BAtCACEPIAEpA3BCAFMNAgsgASABKAIEQX9qNgIEC0IAIQ8LAkAgCg0AIAZB8ABqRAAAAAAAAAAAIAS3phCbBCAGQfgAaikDACETIAYpA3AhEAwBCwJAIA4gEyAIG0IChiAPfEJgfCITQQAgA2utVw0AELQBQcQANgIAIAZBoAFqIAQQlQQgBkGQAWogBikDoAEgBkGgAWpBCGopAwBCf0L///////+///8AEJcEIAZBgAFqIAYpA5ABIAZBkAFqQQhqKQMAQn9C////////v///ABCXBCAGQYABakEIaikDACETIAYpA4ABIRAMAQsCQCATIANBnn5qrFMNAAJAIApBf0wNAANAIAZBoANqIBAgEUIAQoCAgICAgMD/v38QmgQgECARQgBCgICAgICAgP8/EJ0EIQcgBkGQA2ogECARIAYpA6ADIBAgB0F/SiIHGyAGQaADakEIaikDACARIAcbEJoEIApBAXQiASAHciEKIBNCf3whEyAGQZADakEIaikDACERIAYpA5ADIRAgAUF/Sg0ACwsCQAJAIBNBICADa618Ig6nIgdBACAHQQBKGyACIA4gAq1TGyIHQfEASQ0AIAZBgANqIAQQlQQgBkGIA2opAwAhDkIAIQ8gBikDgAMhEkIAIRQMAQsgBkHgAmpEAAAAAAAA8D9BkAEgB2sQngQQmwQgBkHQAmogBBCVBCAGQfACaiAGKQPgAiAGQeACakEIaikDACAGKQPQAiISIAZB0AJqQQhqKQMAIg4QnwQgBkHwAmpBCGopAwAhFCAGKQPwAiEPCyAGQcACaiAKIApBAXFFIAdBIEkgECARQgBCABCcBEEAR3FxIgdyEKAEIAZBsAJqIBIgDiAGKQPAAiAGQcACakEIaikDABCXBCAGQZACaiAGKQOwAiAGQbACakEIaikDACAPIBQQmgQgBkGgAmogEiAOQgAgECAHG0IAIBEgBxsQlwQgBkGAAmogBikDoAIgBkGgAmpBCGopAwAgBikDkAIgBkGQAmpBCGopAwAQmgQgBkHwAWogBikDgAIgBkGAAmpBCGopAwAgDyAUEKEEAkAgBikD8AEiECAGQfABakEIaikDACIRQgBCABCcBA0AELQBQcQANgIACyAGQeABaiAQIBEgE6cQogQgBkHgAWpBCGopAwAhEyAGKQPgASEQDAELELQBQcQANgIA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IgOFIAN9IQMLIARBEGokACADCxAAIABBIEYgAEF3akEFSXIL8QMCBX8CfiMAQSBrIgIkACABQv///////z+DIQcCQAJAIAFCMIhC//8BgyIIpyIDQf+Af2pB/QFLDQAgB0IZiKchBAJAAkAgAFAgAUL///8PgyIHQoCAgAhUIAdCgICACFEbDQAgBEEBaiEEDAELIAAgB0KAgIAIhYRCAFINACAEQQFxIARqIQQLQQAgBCAEQf///wNLIgUbIQRBgYF/QYCBfyAFGyADaiEDDAELAkAgACAHhFANACAIQv//AVINACAHQhmIp0GAgIACciEEQf8BIQMMAQsCQCADQf6AAU0NAEH/ASEDQQAhBAwBCwJAQYD/AEGB/wAgCFAiBRsiBiADayIEQfAATA0AQQAhBEEAIQMMAQsgAkEQaiAAIAcgB0KAgICAgIDAAIQgBRsiB0GAASAEaxCTBCACIAAgByAEEJYEIAJBCGopAwAiAEIZiKchBAJAAkAgAikDACAGIANHIAIpAxAgAkEQakEIaikDAIRCAFJxrYQiB1AgAEL///8PgyIAQoCAgAhUIABCgICACFEbDQAgBEEBaiEEDAELIAcgAEKAgIAIhYRCAFINACAEQQFxIARqIQQLIARBgICABHMgBCAEQf///wNLIgMbIQQLIAJBIGokACADQRd0IAFCIIinQYCAgIB4cXIgBHK+C5AEAgV/An4jAEEgayICJAAgAUL///////8/gyEHAkACQCABQjCIQv//AYMiCKciA0H/h39qQf0PSw0AIABCPIggB0IEhoQhByADQYCIf2qtIQgCQAJAIABC//////////8PgyIAQoGAgICAgICACFQNACAHQgF8IQcMAQsgAEKAgICAgICAgAhSDQAgB0IBgyAHfCEHC0IAIAcgB0L/////////B1YiAxshACADrSAIfCEHDAELAkAgACAHhFANACAIQv//AVINACAAQjyIIAdCBIaEQoCAgICAgIAEhCEAQv8PIQcMAQsCQCADQf6HAU0NAEL/DyEHQgAhAAwBCwJAQYD4AEGB+AAgCFAiBBsiBSADayIGQfAATA0AQgAhAEIAIQcMAQsgAkEQaiAAIAcgB0KAgICAgIDAAIQgBBsiB0GAASAGaxCTBCACIAAgByAGEJYEIAIpAwAiB0I8iCACQQhqKQMAQgSGhCEA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IAIgAkGkkgVGGwsvAAJAIAJFDQADQAJAIAAoAgAgAUcNACAADwsgAEEEaiEAIAJBf2oiAg0ACwtBAAs1AgF/AX0jAEEQayICJAAgAiAAIAFBABCDBSACKQMAIAJBCGopAwAQrwQhAyACQRBqJAAgAwuGAQIBfwJ+IwBBoAFrIgQkACAEIAE2AjwgBCABNgIUIARBfzYCGCAEQRBqQgAQkQQgBCAEQRBqIANBARCoBCAEQQhqKQMAIQUgBCkDACEGAkAgAkUNACACIAEgBCgCFCAEKAI8a2ogBCgCiAFqNgIACyAAIAU3AwggACAGNwMAIARBoAFqJAALNQIBfwF8IwBBEGsiAiQAIAIgACABQQEQgwUgAikDACACQQhqKQMAELAEIQMgAkEQaiQAIAMLPAIBfwF+IwBBEGsiAyQAIAMgASACQQIQgwUgAykDACEEIAAgA0EIaikDADcDCCAAIAQ3AwAgA0EQaiQACwkAIAAgARCCBQsJACAAIAEQhAULOgIBfwF+IwBBEGsiBCQAIAQgASACEIUFIAQpAwAhBSAAIARBCGopAwA3AwggACAFNwMAIARBEGokAAsHACAAEIoFCwcAIAAQyw0LDwAgABCJBRogAEEIENMNC2EBBH8gASAEIANraiEFAkACQANAIAMgBEYNAUF/IQYgASACRg0CIAEsAAAiByADLAAAIghIDQICQCAIIAdODQBBAQ8LIANBAWohAyABQQFqIQEMAAsACyAFIAJHIQYLIAYLDAAgACACIAMQjgUaCy4BAX8jAEEQayIDJAAgACADQQ9qIANBDmoQggQiACABIAIQjwUgA0EQaiQAIAALEgAgACABIAIgASACEK0LEK4LC0IBAn9BACEDA38CQCABIAJHDQAgAw8LIANBBHQgASwAAGoiA0GAgICAf3EiBEEYdiAEciADcyEDIAFBAWohAQwACwsHACAAEIoFCw8AIAAQkQUaIABBCBDTDQtXAQN/AkACQANAIAMgBEYNAUF/IQUgASACRg0CIAEoAgAiBiADKAIAIgdIDQICQCAHIAZODQBBAQ8LIANBBGohAyABQQRqIQEMAAsACyABIAJHIQULIAULDAAgACACIAMQlQUaCy4BAX8jAEEQayIDJAAgACADQQ9qIANBDmoQlgUiACABIAIQlwUgA0EQaiQAIAALCgAgABCwCxCx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EPUNGiAOEPUNGiANEOcNGiAMENUHGgwDCyACIQELIANBAWohAwwACwALIAtBkARqJAAgAAsKACAAEJIIKAIACwcAIABBKGoLFgAgACABEMcNIgFBBGogAhCOBBogAQuAAwEBfyMAQRBrIgokAAJAAkAgAEUNACAKQQRqIAEQpAgiARClCCACIAooAgQ2AAAgCkEEaiABEKYIIAggCkEEahCnCBogCkEEahD1DRogCkEEaiABEKgIIAcgCkEEahCnCBogCkEEahD1DRogAyABEKkINgIAIAQgARCqCDYCACAKQQRqIAEQqwggBSAKQQRqEMkCGiAKQQRqEOcNGiAKQQRqIAEQrAggBiAKQQRqEKcIGiAKQQRqEPUNGiABEK0IIQEMAQsgCkEEaiABEK4IIgEQrwggAiAKKAIENgAAIApBBGogARCwCCAIIApBBGoQpwgaIApBBGoQ9Q0aIApBBGogARCxCCAHIApBBGoQpwgaIApBBGoQ9Q0aIAMgARCyCDYCACAEIAEQswg2AgAgCkEEaiABELQIIAUgCkEEahDJAhogCkEEahDnDRogCkEEaiABELUIIAYgCkEEahCnCBogCkEEahD1DRogARC2CCEBCyAJIAE2AgAgCkEQaiQACxUAIAAgASgCABC4AiABKAIAELcIGgsHACAAKAIACw0AIAAQrQYgAUECdGoLDgAgACABELgINgIAIAALDAAgACABELkIQQFzCwcAIAAoAgALEQAgACAAKAIAQQRqNgIAIAALEAAgABC6CCABELgIa0ECdQsMACAAQQAgAWsQvAgLCwAgACABIAIQuwgL5AEBBn8jAEEQayIDJAAgABC9CCgCACEEAkACQCACKAIAIAAQgwhrIgUQ6gNBAXZPDQAgBUEBdCEFDAELEOoDIQULIAVBBCAFGyEFIAEoAgAhBiAAEIMIIQcCQAJAIARBwQBHDQBBACEIDAELIAAQgwghCAsCQCAIIAUQuAEiCEUNAAJAIARBwQBGDQAgABC+CBoLIANBwAA2AgQgACADQQhqIAggA0EEahC8BiIEEL8IGiAEEL8GGiABIAAQgwggBiAHa2o2AgAgAiAAEIMIIAVBfHFqNgIAIANBEGokAA8LENsNAAsHACAAEMgNC7ACAQJ/IwBBwANrIgckACAHIAI2ArgDIAcgATYCvAMgB0HBADYCFCAHQRhqIAdBIGogB0EUahC8BiEIIAdBEGogBBCFBCAHQRBqELECIQEgB0EAOgAPAkAgB0G8A2ogAiADIAdBEGogBBCMAiAFIAdBD2ogASAIIAdBFGogB0GwA2oQgghFDQAgBhCUCAJAIActAA9BAUcNACAGIAFBLRD7AxD+DQsgAUEwEPsDIQEgCBCDCCECIAcoAhQiA0F8aiEEAkADQCACIARPDQEgAigCACABRw0BIAJBBGohAgwACwALIAYgAiADEJUIGgsCQCAHQbwDaiAHQbgDahCyAkUNACAFIAUoAgBBAnI2AgALIAcoArwDIQIgB0EQahCaBRogCBC/BhogB0HAA2okACACC3ABA38jAEEQayIBJAAgABDYBSECAkACQCAAEOkGRQ0AIAAQlgghAyABQQA2AgwgAyABQQxqEJcIIABBABCYCAwBCyAAEJkIIQMgAUEANgIIIAMgAUEIahCXCCAAQQAQmggLIAAgAhCbCCABQRBqJAAL4AEBBH8jAEEQayIDJAAgABDYBSEEIAAQnAghBQJAIAEgAhCdCCIGRQ0AAkAgACABEJ4IDQACQCAFIARrIAZPDQAgACAFIAQgBWsgBmogBCAEQQBBABCfCAsgACAGEKAIIAAQrQYgBEECdGohBQJAA0AgASACRg0BIAUgARCXCCABQQRqIQEgBUEEaiEFDAALAAsgA0EANgIEIAUgA0EEahCXCCAAIAYgBGoQoQgMAQsgACADQQRqIAEgAiAAEKIIEKMIIgEQ5wYgARDYBRD8DRogARD1DRoLIANBEGokACAACwoAIAAQvwcoAgALDAAgACABKAIANgIACwwAIAAQvwcgATYCBAsKACAAEL8HEMALCzEBAX8gABC/ByICIAItAAtBgAFxIAFB/wBxcjoACyAAEL8HIgAgAC0AC0H/AHE6AAsLAgALHwEBf0EBIQECQCAAEOkGRQ0AIAAQzgtBf2ohAQsgAQsJACAAIAEQiQwLHQAgABDnBiAAEOcGIAAQ2AVBAnRqQQRqIAEQigwLKQAgACABIAIgAyAEIAUgBhCIDCAAIAMgBWsgBmoiBhCYCCAAIAYQqAcLAgALHAACQCAAEOkGRQ0AIAAgARCYCA8LIAAgARCaCAsHACAAEMILCysBAX8jAEEQayIEJAAgACAEQQ9qIAMQiwwiAyABIAIQjAwgBEEQaiQAIAMLCwAgAEGomgUQnwULEQAgACABIAEoAgAoAiwRAgALEQAgACABIAEoAgAoAiARAgALCwAgACABEMAIIAALEQAgACABIAEoAgAoAhwRAgALDwAgACAAKAIAKAIMEQAACw8AIAAgACgCACgCEBEAAAsRACAAIAEgASgCACgCFBECAAsRACAAIAEgASgCACgCGBECAAsPACAAIAAoAgAoAiQRAAALCwAgAEGgmgUQnwULEQAgACABIAEoAgAoAiwRAgALEQAgACABIAEoAgAoAiARAgALEQAgACABIAEoAgAoAhwRAgALDwAgACAAKAIAKAIMEQAACw8AIAAgACgCACgCEBEAAAsRACAAIAEgASgCACgCFBECAAsRACAAIAEgASgCACgCGBECAAsPACAAIAAoAgAoAiQRAAALEgAgACACNgIEIAAgATYCACAACwcAIAAoAgALDQAgABC6CCABELgIRgsHACAAKAIACy8BAX8jAEEQayIDJAAgABCQDCABEJAMIAIQkAwgA0EPahCRDCECIANBEGokACACCzIBAX8jAEEQayICJAAgAiAAKAIANgIMIAJBDGogARCXDBogAigCDCEAIAJBEGokACAACwcAIAAQ0wgLGgEBfyAAENIIKAIAIQEgABDSCEEANgIAIAELIgAgACABEL4IEL0GIAEQvQgoAgAhASAAENMIIAE2AgAgAAvPAQEFfyMAQRBrIgIkACAAEMsLAkAgABDpBkUNACAAEKIIIAAQlgggABDOCxDMCwsgARDYBSEDIAEQ6QYhBCAAIAEQmAwgARC/ByEFIAAQvwciBkEIaiAFQQhqKAIANgIAIAYgBSkCADcCACABQQAQmgggARCZCCEFIAJBADYCDCAFIAJBDGoQlwgCQAJAIAAgAUYiBQ0AIAQNACABIAMQmwgMAQsgAUEAEKgHCyAAEOkGIQECQCAFDQAgAQ0AIAAgABDrBhCoBwsgAkEQaiQAC4QFAQx/IwBBwANrIgckACAHIAU3AxAgByAGNwMYIAcgB0HQAmo2AswCIAdB0AJqQeQAQcqEBCAHQRBqEN8EIQggB0HAADYC4AFBACEJIAdB2AFqQQAgB0HgAWoQnAYhCiAHQcAANgLgASAHQdABakEAIAdB4AFqEJwGIQsgB0HgAWohDAJAAkAgCEHkAEkNABDMBSEIIAcgBTcDACAH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EL8CIg8gB0HYA2oQpgciDiAHQcwDahCmByIQIAdByANqENAIIAdBwAA2AjAgB0EoakEAIAdBMGoQvAYhEQJAAkAgCCAHKALIAyICTA0AIBAQ2AUgCCACa0EBdGogDhDYBWogBygCyANqQQFqIRIMAQsgEBDYBSAOENgFaiAHKALIA2pBAmohEgsgB0EwaiECAkAgEkHlAEkNACARIBJBAnQQtQEQvQYgERCDCCICRQ0BCyACIAdBJGogB0EgaiADEIwCIAwgDCAIQQJ0aiANIAkgB0H4A2ogBygC9AMgBygC8AMgDyAOIBAgBygCyAMQ0QggASACIAcoAiQgBygCICADIAQQswYhCCAREL8GGiAQEPUNGiAOEPUNGiAPEOcNGiAHQfwDahCaBRogCxC/BhogChCgBhogB0GgCGokACAIDwsQ2w0ACwoAIAAQ1AhBAXMLxgMBAX8jAEEQayIKJAACQAJAIABFDQAgAhCkCCECAkACQCABRQ0AIApBBGogAhClCCADIAooAgQ2AAAgCkEEaiACEKYIIAggCkEEahCnCBogCkEEahD1DRoMAQsgCkEEaiACENUIIAMgCigCBDYAACAKQQRqIAIQqAggCCAKQQRqEKcIGiAKQQRqEPUNGgsgBCACEKkINgIAIAUgAhCqCDYCACAKQQRqIAIQqwggBiAKQQRqEMkCGiAKQQRqEOcNGiAKQQRqIAIQrAggByAKQQRqEKcIGiAKQQRqEPUNGiACEK0IIQIMAQsgAhCuCCECAkACQCABRQ0AIApBBGogAhCvCCADIAooAgQ2AAAgCkEEaiACELAIIAggCkEEahCnCBogCkEEahD1DRoMAQsgCkEEaiACENYIIAMgCigCBDYAACAKQQRqIAIQsQggCCAKQQRqEKcIGiAKQQRqEPUNGgsgBCACELIINgIAIAUgAhCzCDYCACAKQQRqIAIQtAggBiAKQQRqEMkCGiAKQQRqEOcNGiAKQQRqIAIQtQggByAKQQRqEKcIGiAKQQRqEPUNGiACELYIIQILIAkgAjYCACAKQRBqJAALxwYBCn8jAEEQayIPJAAgAiAANgIAQQRBACAHGyEQIANBgARxIRFBACESA0ACQCASQQRHDQACQCANENgFQQFNDQAgDyANENcINgIMIAIgD0EMakEBENgIIA0Q2QggAigCABDaCDYCAAsCQCADQbABcSIHQRBGDQACQCAHQSBHDQAgAigCACEACyABIAA2AgALIA9BEGokAA8LAkACQAJAAkACQAJAIAggEmotAAAOBQABAwIEBQsgASACKAIANgIADAQLIAEgAigCADYCACAGQSAQ+wMhByACIAIoAgAiE0EEajYCACATIAc2AgAMAwsgDRDaBQ0CIA1BABDZBSgCACEHIAIgAigCACITQQRqNgIAIBMgBzYCAAwCCyAMENoFIQcgEUUNASAHDQEgAiAMENcIIAwQ2QggAigCABDaCDYCAAwBCyACKAIAIRQgBCAQaiIEIQcCQANAIAcgBU8NASAGQcAAIAcoAgAQtAJFDQEgB0EEaiEHDAALAAsCQCAOQQFIDQAgAigCACEVIA4hEwJAA0AgByAETQ0BIBNBAEYNASATQX9qIRMgB0F8aiIHKAIAIRYgAiAVQQRqIhc2AgAgFSAWNgIAIBchFQwACwALAkACQCATDQBBACEXDAELIAZBMBD7AyEXCyACKAIAIRUCQANAIBNBAUgNASACIBVBBGoiFjYCACAVIBc2AgAgE0F/aiETIBYhFQwACwALIAIgAigCACITQQRqNgIAIBMgCTYCAAsCQAJAIAcgBEcNACAGQTAQ+wMhByACIAIoAgAiE0EEajYCACATIAc2AgAMAQsCQAJAIAsQpQVFDQAQzAghFwwBCyALQQAQpAUsAAAhFwtBACETQQAhGANAIAcgBEYNAQJAAkAgEyAXRg0AIBMhFQwBCyACIAIoAgAiFUEEajYCACAVIAo2AgBBACEVAkAgGEEBaiIYIAsQ3wJJDQAgEyEXDAELAkAgCyAYEKQFLQAAEI0HQf8BcUcNABDMCCEXDAELIAsgGBCkBSwAACEXCyAHQXxqIgcoAgAhEyACIAIoAgAiFkEEajYCACAWIBM2AgAgFUEBaiETDAALAAsgFCACKAIAEMcGCyASQQFqIRIMAAsACwcAIAAQyQ0LCgAgAEEEahCPBAsNACAAEJIIKAIAQQBHCxEAIAAgASABKAIAKAIoEQIACxEAIAAgASABKAIAKAIoEQIACwwAIAAgABDoBhDhCAsyAQF/IwBBEGsiAiQAIAIgACgCADYCDCACQQxqIAEQ4ggaIAIoAgwhACACQRBqJAAgAAsVACAAIAAQ6AYgABDYBUECdGoQ4QgLKwEBfyMAQRBrIgMkACADQQhqIAAgASACEOAIIAMoAgwhAiADQRBqJAAgAgu3AwEIfyMAQeADayIGJAAgBkHcA2ogAxCFBCAGQdwDahCxAiEHQQAhCAJAIAUQ2AVFDQAgBUEAENkFKAIAIAdBLRD7A0YhCAsgAiAIIAZB3ANqIAZB2ANqIAZB1ANqIAZB0ANqIAZBxANqEL8CIgkgBkG4A2oQpgciCiAGQawDahCmByILIAZBqANqENAIIAZBwAA2AhAgBkEIakEAIAZBEGoQvAYhDAJAAkAgBRDYBSAGKAKoA0wNACAFENgFIQIgBigCqAMhDSALENgFIAIgDWtBAXRqIAoQ2AVqIAYoAqgDakEBaiENDAELIAsQ2AUgChDYBWogBigCqANqQQJqIQ0LIAZBEGohAgJAIA1B5QBJDQAgDCANQQJ0ELUBEL0GIAwQgwgiAg0AENsNAAsgAiAGQQRqIAYgAxCMAiAFEOcGIAUQ5wYgBRDYBUECdGogByAIIAZB2ANqIAYoAtQDIAYoAtADIAkgCiALIAYoAqgDENEIIAEgAiAGKAIEIAYoAgAgAyAEELMGIQUgDBC/BhogCxD1DRogChD1DRogCRDnDRogBkHcA2oQmgUaIAZB4ANqJAAgBQsNACAAIAEgAiADEJoMCyUBAX8jAEEQayICJAAgAkEMaiABEKkMKAIAIQEgAkEQaiQAIAELBABBfwsRACAAIAAoAgAgAWo2AgAgAAsNACAAIAEgAiADEKoMCyUBAX8jAEEQayICJAAgAkEMaiABELkMKAIAIQEgAkEQaiQAIAELFAAgACAAKAIAIAFBAnRqNgIAIAALBABBfwsKACAAIAUQtwcaCwIACwQAQX8LCgAgACAFELoHGgsCAAsmACAAQZjLBDYCAAJAIAAoAggQzAVGDQAgACgCCBD2BAsgABCKBQubAwAgACABEOsIIgFByMIENgIAIAFBCGpBHhDsCCEAIAFBkAFqQc+HBBCBBBogABDtCBDuCCABQfylBRDvCBDwCCABQYSmBRDxCBDyCCABQYymBRDzCBD0CCABQZymBRD1CBD2CCABQaSmBRD3CBD4CCABQaymBRD5CBD6CCABQbimBRD7CBD8CCABQcCmBRD9CBD+CCABQcimBRD/CBCACSABQdCmBRCBCRCCCSABQdimBRCDCRCECSABQfCmBRCFCRCGCSABQYynBRCHCRCICSABQZSnBRCJCRCKCSABQZynBRCLCRCMCSABQaSnBRCNCRCOCSABQaynBRCPCRCQCSABQbSnBRCRCRCSCSABQbynBRCTCRCUCSABQcSnBRCVCRCWCSABQcynBRCXCRCYCSABQdSnBRCZCRCaCSABQdynBRCbCRCcCSABQeSnBRCdCRCeCSABQeynBRCfCRCgCSABQfinBRChCRCiCSABQYSoBRCjCRCkCSABQZCoBRClCRCmCSABQZyoBRCnCRCoCSABQaSoBRCpCSABCxcAIAAgAUF/ahCqCSIBQZDOBDYCACABC2oBAX8jAEEQayICJAAgAEIANwIAIAJBADYCDCAAQQhqIAJBDGogAkELahCrCRogAkEKaiACQQRqIAAQrAkoAgAQrQkCQCABRQ0AIAAgARCuCSAAIAEQrwkLIAJBCmoQsAkgAkEQaiQAIAALFwEBfyAAELEJIQEgABCyCSAAIAEQswkLDABB/KUFQQEQtgkaCxAAIAAgAUHAmQUQtAkQtQkLDABBhKYFQQEQtwkaCxAAIAAgAUHImQUQtAkQtQkLEABBjKYFQQBBAEEBELgJGgsQACAAIAFBoJwFELQJELUJCwwAQZymBUEBELkJGgsQACAAIAFBmJwFELQJELUJCwwAQaSmBUEBELoJGgsQACAAIAFBqJwFELQJELUJCwwAQaymBUEBELsJGgsQACAAIAFBsJwFELQJELUJCwwAQbimBUEBELwJGgsQACAAIAFBuJwFELQJELUJCwwAQcCmBUEBEL0JGgsQACAAIAFByJwFELQJELUJCwwAQcimBUEBEL4JGgsQACAAIAFBwJwFELQJELUJCwwAQdCmBUEBEL8JGgsQACAAIAFB0JwFELQJELUJCwwAQdimBUEBEMAJGgsQACAAIAFB2JwFELQJELUJCwwAQfCmBUEBEMEJGgsQACAAIAFB4JwFELQJELUJCwwAQYynBUEBEMIJGgsQACAAIAFB0JkFELQJELUJCwwAQZSnBUEBEMMJGgsQACAAIAFB2JkFELQJELUJCwwAQZynBUEBEMQJGgsQACAAIAFB4JkFELQJELUJCwwAQaSnBUEBEMUJGgsQACAAIAFB6JkFELQJELUJCwwAQaynBUEBEMYJGgsQACAAIAFBkJoFELQJELUJCwwAQbSnBUEBEMcJGgsQACAAIAFBmJoFELQJELUJCwwAQbynBUEBEMgJGgsQACAAIAFBoJoFELQJELUJCwwAQcSnBUEBEMkJGgsQACAAIAFBqJoFELQJELUJCwwAQcynBUEBEMoJGgsQACAAIAFBsJoFELQJELUJCwwAQdSnBUEBEMsJGgsQACAAIAFBuJoFELQJELUJCwwAQdynBUEBEMwJGgsQACAAIAFBwJoFELQJELUJCwwAQeSnBUEBEM0JGgsQACAAIAFByJoFELQJELUJCwwAQeynBUEBEM4JGgsQACAAIAFB8JkFELQJELUJCwwAQfinBUEBEM8JGgsQACAAIAFB+JkFELQJELUJCwwAQYSoBUEBENAJGgsQACAAIAFBgJoFELQJELUJCwwAQZCoBUEBENEJGgsQACAAIAFBiJoFELQJELUJCwwAQZyoBUEBENIJGgsQACAAIAFB0JoFELQJELUJCwwAQaSoBUEBENMJGgsQACAAIAFB2JoFELQJELUJCxcAIAAgATYCBCAAQdj2BEEIajYCACAACxQAIAAgARC6DCIBQQRqELsMGiABCwsAIAAgATYCACAACwoAIAAgARC8DBoLZwECfyMAQRBrIgIkAAJAIAEgABC9DE0NACAAEL4MAAsgAkEIaiAAEL8MIAEQwAwgACACKAIIIgE2AgQgACABNgIAIAIoAgwhAyAAEMEMIAEgA0ECdGo2AgAgAEEAEMIMIAJBEGokAAteAQN/IwBBEGsiAiQAIAJBBGogACABEMMMIgMoAgQhASADKAIIIQQDQAJAIAEgBEcNACADEMQMGiACQRBqJAAPCyAAEL8MIAEQxQwQxgwgAyABQQRqIgE2AgQMAAsACwkAIABBAToAAAsQACAAKAIEIAAoAgBrQQJ1CwwAIAAgACgCABDYDAsCAAsxAQF/IwBBEGsiASQAIAEgADYCDCAAIAFBDGoQ/gkgACgCBCEAIAFBEGokACAAQX9qC3gBAn8jAEEQayIDJAAgARDWCSADQQxqIAEQ3QkhBAJAIAIgAEEIaiIBELEJSQ0AIAEgAkEBahDgCQsCQCABIAIQ1QkoAgBFDQAgASACENUJKAIAEOEJGgsgBBDiCSEAIAEgAhDVCSAANgIAIAQQ3gkaIANBEGokAAsUACAAIAEQ6wgiAUHo1gQ2AgAgAQsUACAAIAEQ6wgiAUGI1wQ2AgAgAQs1ACAAIAMQ6wgQlAoiAyACOgAMIAMgATYCCCADQdzCBDYCAAJAIAENACADQZDDBDYCCAsgAwsXACAAIAEQ6wgQlAoiAUHIzgQ2AgAgAQsXACAAIAEQ6wgQpwoiAUHgzwQ2AgAgAQsfACAAIAEQ6wgQpwoiAUGYywQ2AgAgARDMBTYCCCABCxcAIAAgARDrCBCnCiIBQfTQBDYCACABCxcAIAAgARDrCBCnCiIBQdzSBDYCACABCxcAIAAgARDrCBCnCiIBQejRBDYCACABCxcAIAAgARDrCBCnCiIBQdDTBDYCACABCyYAIAAgARDrCCIBQa7YADsBCCABQcjLBDYCACABQQxqEL8CGiABCykAIAAgARDrCCIBQq6AgIDABTcCCCABQfDLBDYCACABQRBqEL8CGiABCxQAIAAgARDrCCIBQajXBDYCACABCxQAIAAgARDrCCIBQaDZBDYCACABCxQAIAAgARDrCCIBQfTaBDYCACABCxQAIAAgARDrCCIBQeDcBDYCACABCxcAIAAgARDrCBCTDSIBQcTkBDYCACABCxcAIAAgARDrCBCTDSIBQdjlBDYCACABCxcAIAAgARDrCBCTDSIBQczmBDYCACABCxcAIAAgARDrCBCTDSIBQcDnBDYCACABCxcAIAAgARDrCBCUDSIBQbToBDYCACABCxcAIAAgARDrCBCVDSIBQdzpBDYCACABCxcAIAAgARDrCBCWDSIBQYTrBDYCACABCxcAIAAgARDrCBCXDSIBQazsBDYCACABCycAIAAgARDrCCIBQQhqEJgNIQAgAUGo3gQ2AgAgAEHY3gQ2AgAgAQsnACAAIAEQ6wgiAUEIahCZDSEAIAFBtOAENgIAIABB5OAENgIAIAELHQAgACABEOsIIgFBCGoQmg0aIAFBpOIENgIAIAELHQAgACABEOsIIgFBCGoQmg0aIAFBxOMENgIAIAELFwAgACABEOsIEJsNIgFB1O0ENgIAIAELFwAgACABEOsIEJsNIgFBzO4ENgIAIAELWwECfyMAQRBrIgAkAAJAQQAtAIicBQ0AIAAQ1wk2AghBhJwFIABBD2ogAEEIahDYCRpBwgBBAEGAgAQQ7gQaQQBBAToAiJwFC0GEnAUQ2gkhASAAQRBqJAAgAQsNACAAKAIAIAFBAnRqCwsAIABBBGoQ2wkaCzMBAn8jAEEQayIAJAAgAEEBNgIMQeiaBSAAQQxqEPEJGkHomgUQ8gkhASAAQRBqJAAgAQsMACAAIAIoAgAQ8wkLCgBBhJwFEPQJGgsEACAACxUBAX8gACAAKAIAQQFqIgE2AgAgAQsfAAJAIAAgARDsCQ0AEPoCAAsgAEEIaiABEO0JKAIACykBAX8jAEEQayICJAAgAiABNgIMIAAgAkEMahDfCSEBIAJBEGokACABCwkAIAAQ4wkgAAsJACAAIAEQnA0LOAEBfwJAIAEgABCxCSICTQ0AIAAgASACaxDpCQ8LAkAgASACTw0AIAAgACgCACABQQJ0ahDqCQsLKAEBfwJAIABBBGoQ5gkiAUF/Rw0AIAAgACgCACgCCBEEAAsgAUF/RgsaAQF/IAAQ6wkoAgAhASAAEOsJQQA2AgAgAQslAQF/IAAQ6wkoAgAhASAAEOsJQQA2AgACQCABRQ0AIAEQnQ0LC2UBAn8gAEHIwgQ2AgAgAEEIaiEBQQAhAgJAA0AgAiABELEJTw0BAkAgASACENUJKAIARQ0AIAEgAhDVCSgCABDhCRoLIAJBAWohAgwACwALIABBkAFqEOcNGiABEOUJGiAAEIoFCyMBAX8jAEEQayIBJAAgAUEMaiAAEKwJEOcJIAFBEGokACAACxUBAX8gACAAKAIAQX9qIgE2AgAgAQs7AQF/AkAgACgCACIBKAIARQ0AIAEQsgkgACgCABDeDCAAKAIAEL8MIAAoAgAiACgCACAAENsMEN8MCwsNACAAEOQJQZwBENMNC3ABAn8jAEEgayICJAACQAJAIAAQwQwoAgAgACgCBGtBAnUgAUkNACAAIAEQrwkMAQsgABC/DCEDIAJBDGogACAAELEJIAFqENwMIAAQsQkgAxDkDCIDIAEQ5QwgACADEOYMIAMQ5wwaCyACQSBqJAALGQEBfyAAELEJIQIgACABENgMIAAgAhCzCQsHACAAEJ4NCysBAX9BACECAkAgASAAQQhqIgAQsQlPDQAgACABEO0JKAIAQQBHIQILIAILDQAgACgCACABQQJ0agsPAEHDAEEAQYCABBDuBBoLCgBB6JoFEPAJGgsEACAACwwAIAAgASgCABDqCAsEACAACwsAIAAgATYCACAACwQAIAALNgACQEEALQCQnAUNAEGMnAUQ1AkQ9gkaQcQAQQBBgIAEEO4EGkEAQQE6AJCcBQtBjJwFEPgJCwkAIAAgARD5CQsKAEGMnAUQ9AkaCwQAIAALFQAgACABKAIAIgE2AgAgARD6CSAACxYAAkAgAEHomgUQ8glGDQAgABDWCQsLFwACQCAAQeiaBRDyCUYNACAAEOEJGgsLGAEBfyAAEPUJKAIAIgE2AgAgARD6CSAACw8AIAAoAgAgARC0CRDsCQs7AQF/IwBBEGsiAiQAAkAgABCBCkF/Rg0AIAAgAkEIaiACQQxqIAEQggoQgwpBxQAQ7wQLIAJBEGokAAsMACAAEIoFQQgQ0w0LDwAgACAAKAIAKAIEEQQACwcAIAAoAgALCQAgACABEJ8NCwsAIAAgATYCACAACwcAIAAQoA0LDAAgABCKBUEIENMNCyoBAX9BACEDAkAgAkH/AEsNACACQQJ0QZDDBGooAgAgAXFBAEchAwsgAwtOAQJ/AkADQCABIAJGDQFBACEEAkAgASgCACIFQf8ASw0AIAVBAnRBkMMEaigCACEECyADIAQ2AgAgA0EEaiEDIAFBBGohAQwACwALIAELPwEBfwJAA0AgAiADRg0BAkAgAigCACIEQf8ASw0AIARBAnRBkMMEaigCACABcQ0CCyACQQRqIQIMAAsACyACCz0BAX8CQANAIAIgA0YNASACKAIAIgRB/wBLDQEgBEECdEGQwwRqKAIAIAFxRQ0BIAJBBGohAgwACwALIAILHQACQCABQf8ASw0AEIsKIAFBAnRqKAIAIQELIAELCAAQ+AQoAgALRQEBfwJAA0AgASACRg0BAkAgASgCACIDQf8ASw0AEIsKIAEoAgBBAnRqKAIAIQMLIAEgAzYCACABQQRqIQEMAAsACyABCx0AAkAgAUH/AEsNABCOCiABQQJ0aigCACEBCyABCwgAEPkEKAIAC0UBAX8CQANAIAEgAkYNAQJAIAEoAgAiA0H/AEsNABCOCiABKAIAQQJ0aigCACEDCyABIAM2AgAgAUEEaiEBDAALAAsgAQsEACABCywAAkADQCABIAJGDQEgAyABLAAANgIAIANBBGohAyABQQFqIQEMAAsACyABCw4AIAEgAiABQYABSRvACzkBAX8CQANAIAEgAkYNASAEIAEoAgAiBSADIAVBgAFJGzoAACAEQQFqIQQgAUEEaiEBDAALAAsgAQsEACAACy4BAX8gAEHcwgQ2AgACQCAAKAIIIgFFDQAgAC0ADEEBRw0AIAEQ1A0LIAAQigULDAAgABCVCkEQENMNCx0AAkAgAUEASA0AEIsKIAFBAnRqKAIAIQELIAHAC0QBAX8CQANAIAEgAkYNAQJAIAEsAAAiA0EASA0AEIsKIAEsAABBAnRqKAIAIQMLIAEgAzoAACABQQFqIQEMAAsACyABCx0AAkAgAUEASA0AEI4KIAFBAnRqKAIAIQELIAHAC0QBAX8CQANAIAEgAkYNAQJAIAEsAAAiA0EASA0AEI4KIAEsAABBAnRqKAIAIQMLIAEgAzoAACABQQFqIQEMAAsACyABCwQAIAELLAACQANAIAEgAkYNASADIAEtAAA6AAAgA0EBaiEDIAFBAWohAQwACwALIAELDAAgAiABIAFBAEgbCzgBAX8CQANAIAEgAkYNASAEIAMgASwAACIFIAVBAEgbOgAAIARBAWohBCABQQFqIQEMAAsACyABCwwAIAAQigVBCBDTDQsSACAEIAI2AgAgByAFNgIAQQMLEgAgBCACNgIAIAcgBTYCAEEDCwsAIAQgAjYCAEEDCwQAQQELBABBAQs5AQF/IwBBEGsiBSQAIAUgBDYCDCAFIAMgAms2AgggBUEMaiAFQQhqEPgCKAIAIQQgBUEQaiQAIAQLBABBAQsEACAACwwAIAAQ6QhBDBDTDQvuAwEEfyMAQRBrIggkACACIQkCQANAAkAgCSADRw0AIAMhCQwCCyAJKAIARQ0BIAlBBGohCQwACwALIAcgBTYCACAEIAI2AgACQAJAA0ACQAJAIAIgA0YNACAFIAZGDQAgCCABKQIANwMIQQEhCgJAAkACQAJAIAUgBCAJIAJrQQJ1IAYgBWsgASAAKAIIEKoKIgtBAWoOAgAIAQsgByAFNgIAA0AgAiAEKAIARg0CIAUgAigCACAIQQhqIAAoAggQqwoiCUF/Rg0CIAcgBygCACAJaiIFNgIAIAJBBGohAgwACwALIAcgBygCACALaiIFNgIAIAUgBkYNAQJAIAkgA0cNACAEKAIAIQIgAyEJDAULIAhBBGpBACABIAAoAggQqwoiCUF/Rg0FIAhBBGohAgJAIAkgBiAHKAIAa00NAEEBIQoMBwsCQANAIAlFDQEgAi0AACEFIAcgBygCACIKQQFqNgIAIAogBToAACAJQX9qIQkgAkEBaiECDAALAAsgBCAEKAIAQQRqIgI2AgAgAiEJA0ACQCAJIANHDQAgAyEJDAULIAkoAgBFDQQgCUEEaiEJDAALAAsgBCACNgIADAQLIAQoAgAhAgsgAiADRyEKDAMLIAcoAgAhBQwACwALQQIhCgsgCEEQaiQAIAoLQQEBfyMAQRBrIgYkACAGIAU2AgwgBkEIaiAGQQxqEM8FIQUgACABIAIgAyAEEPoEIQQgBRDQBRogBkEQaiQAIAQLPQEBfyMAQRBrIgQkACAEIAM2AgwgBEEIaiAEQQxqEM8FIQMgACABIAIQxgQhAiADENAFGiAEQRBqJAAgAgu7AwEDfyMAQRBrIggkACACIQkCQANAAkAgCSADRw0AIAMhCQwCCyAJLQAARQ0BIAlBAWohCQwACwALIAcgBTYCACAEIAI2AgADfwJAAkACQCACIANGDQAgBSAGRg0AIAggASkCADcDCAJAAkACQAJAAkAgBSAEIAkgAmsgBiAFa0ECdSABIAAoAggQrQoiCkF/Rw0AA0AgByAFNgIAIAIgBCgCAEYNBkEBIQYCQAJAAkAgBSACIAkgAmsgCEEIaiAAKAIIEK4KIgVBAmoOAwcAAgELIAQgAjYCAAwECyAFIQYLIAIgBmohAiAHKAIAQQRqIQUMAAsACyAHIAcoAgAgCkECdGoiBTYCACAFIAZGDQMgBCgCACECAkAgCSADRw0AIAMhCQwICyAFIAJBASABIAAoAggQrgpFDQELQQIhCQwECyAHIAcoAgBBBGo2AgAgBCAEKAIAQQFqIgI2AgAgAiEJA0ACQCAJIANHDQAgAyEJDAYLIAktAABFDQUgCUEBaiEJDAALAAsgBCACNgIAQQEhCQwCCyAEKAIAIQILIAIgA0chCQsgCEEQaiQAIAkPCyAHKAIAIQUMAAsLQQEBfyMAQRBrIgYkACAGIAU2AgwgBkEIaiAGQQxqEM8FIQUgACABIAIgAyAEEPwEIQQgBRDQBRogBkEQaiQAIAQLPwEBfyMAQRBrIgUkACAFIAQ2AgwgBUEIaiAFQQxqEM8FIQQgACABIAIgAxCxBCEDIAQQ0AUaIAVBEGokACADC5oBAQJ/IwBBEGsiBSQAIAQgAjYCAEECIQYCQCAFQQxqQQAgASAAKAIIEKsKIgJBAWpBAkkNAEEBIQYgAkF/aiICIAMgBCgCAGtLDQAgBUEMaiEGA0ACQCACDQBBACEGDAILIAYtAAAhACAEIAQoAgAiAUEBajYCACABIAA6AAAgAkF/aiECIAZBAWohBgwACwALIAVBEGokACAGCzAAAkBBAEEAQQQgACgCCBCxCkUNAEF/DwsCQCAAKAIIIgANAEEBDwsgABCyCkEBRgs9AQF/IwBBEGsiBCQAIAQgAzYCDCAEQQhqIARBDGoQzwUhAyAAIAEgAhD9BCECIAMQ0AUaIARBEGokACACCzcBAn8jAEEQayIBJAAgASAANgIMIAFBCGogAUEMahDPBSEAEP4EIQIgABDQBRogAUEQaiQAIAILBABBAAtkAQR/QQAhBUEAIQYCQANAIAYgBE8NASACIANGDQFBASEHAkACQCACIAMgAmsgASAAKAIIELUKIghBAmoOAwMDAQALIAghBwsgBkEBaiEGIAcgBWohBSACIAdqIQIMAAsACyAFCz0BAX8jAEEQayIEJAAgBCADNgIMIARBCGogBEEMahDPBSEDIAAgASACEP8EIQIgAxDQBRogBEEQaiQAIAILFgACQCAAKAIIIgANAEEBDwsgABCyCgsMACAAEIoFQQgQ0w0LVgEBfyMAQRBrIggkACAIIAI2AgwgCCAFNgIIIAIgAyAIQQxqIAUgBiAIQQhqQf//wwBBABC5CiECIAQgCCgCDDYCACAHIAgoAgg2AgAgCEEQaiQAIAILlQYBAX8gAiAANgIAIAUgAzYCAAJAAkAgB0ECcUUNACAEIANrQQNIDQEgBSADQQFqNgIAIANB7wE6AAAgBSAFKAIAIgNBAWo2AgAgA0G7AToAACAFIAUoAgAiA0EBajYCACADQb8BOgAACyACKAIAIQACQANAAkAgACABSQ0AQQAhBwwCC0ECIQcgBiAALwEAIgNJDQECQAJAAkAgA0H/AEsNAEEBIQcgBCAFKAIAIgBrQQFIDQQgBSAAQQFqNgIAIAAgAzoAAAwBCwJAIANB/w9LDQAgBCAFKAIAIgBrQQJIDQUgBSAAQQFqNgIAIAAgA0EGdkHAAXI6AAAgBSAFKAIAIgBBAWo2AgAgACADQT9xQYABcjoAAAwBCwJAIANB/68DSw0AIAQgBSgCACIAa0EDSA0FIAUgAEEBajYCACAAIANBDHZB4AFyOgAAIAUgBSgCACIAQQFqNgIAIAAgA0EGdkE/cUGAAXI6AAAgBSAFKAIAIgBBAWo2AgAgACADQT9xQYABcjoAAAwBCwJAIANB/7cDSw0AQQEhByABIABrQQNIDQQgAC8BAiIIQYD4A3FBgLgDRw0CIAQgBSgCAGtBBEgNBCADQcAHcSIHQQp0IANBCnRBgPgDcXIgCEH/B3FyQYCABGogBksNAiACIABBAmo2AgAgBSAFKAIAIgBBAWo2AgAgACAHQQZ2QQFqIgdBAnZB8AFyOgAAIAUgBSgCACIAQQFqNgIAIAAgB0EEdEEwcSADQQJ2QQ9xckGAAXI6AAAgBSAFKAIAIgBBAWo2AgAgACAIQQZ2QQ9xIANBBHRBMHFyQYABcjoAACAFIAUoAgAiA0EBajYCACADIAhBP3FBgAFyOgAADAELIANBgMADSQ0DIAQgBSgCACIAa0EDSA0EIAUgAEEBajYCACAAIANBDHZB4AFyOgAAIAUgBSgCACIAQQFqNgIAIAAgA0EGdkG/AXE6AAAgBSAFKAIAIgBBAWo2AgAgACADQT9xQYABcjoAAAsgAiACKAIAQQJqIgA2AgAMAQsLQQIPCyAHDwtBAQtWAQF/IwBBEGsiCCQAIAggAjYCDCAIIAU2AgggAiADIAhBDGogBSAGIAhBCGpB///DAEEAELsKIQIgBCAIKAIMNgIAIAcgCCgCCDYCACAIQRBqJAAgAgvxBQEEfyACIAA2AgAgBSADNgIAAkAgB0EEcUUNACABIAIoAgAiAGtBA0gNACAALQAAQe8BRw0AIAAtAAFBuwFHDQAgAC0AAkG/AUcNACACIABBA2o2AgALAkACQAJAA0AgAigCACIDIAFPDQEgBSgCACIHIARPDQFBAiEIIAYgAy0AACIASQ0DAkACQCAAwEEASA0AIAcgADsBACADQQFqIQAMAQsgAEHCAUkNBAJAIABB3wFLDQACQCABIANrQQJODQBBAQ8LIAMtAAEiCUHAAXFBgAFHDQRBAiEIIAlBP3EgAEEGdEHAD3FyIgAgBksNBCAHIAA7AQAgA0ECaiEADAELAkAgAEHvAUsNAEEBIQggASADayIKQQJIDQQgAywAASEJAkACQAJAIABB7QFGDQAgAEHgAUcNASAJQWBxQaB/Rw0IDAILIAlBoH9ODQcMAQsgCUG/f0oNBgsgCkECRg0EIAMtAAIiCkHAAXFBgAFHDQVBAiEIIApBP3EgCUE/cUEGdCAAQQx0cnIiAEH//wNxIAZLDQQgByAAOwEAIANBA2ohAAwBCyAAQfQBSw0EQQEhCCABIANrIglBAkgNAyADLQABIgrAIQsCQAJAAkACQCAAQZB+ag4FAAICAgECCyALQfAAakH/AXFBME8NBwwCCyALQZB/Tg0GDAELIAtBv39KDQULIAlBAkYNAyADLQACIgtBwAFxQYABRw0EIAlBA0YNAyADLQADIgNBwAFxQYABRw0EIAQgB2tBA0gNA0ECIQggA0E/cSIDIAtBBnQiCUHAH3EgCkEMdEGA4A9xIABBB3EiAEESdHJyciAGSw0DIAcgAEEIdCAKQQJ0IgBBwAFxciAAQTxxciALQQR2QQNxckHA/wBqQYCwA3I7AQAgBSAHQQJqNgIAIAcgAyAJQcAHcXJBgLgDcjsBAiACKAIAQQRqIQALIAIgADYCACAFIAUoAgBBAmo2AgAMAAsACyADIAFJIQgLIAgPC0ECCwsAIAQgAjYCAEEDCwQAQQALBABBAAsSACACIAMgBEH//8MAQQAQwAoLsgQBBX8gACEFAkAgASAAa0EDSA0AIAAhBSAEQQRxRQ0AIAAhBSAALQAAQe8BRw0AIAAhBSAALQABQbsBRw0AIABBA0EAIAAtAAJBvwFGG2ohBQtBACEGAkADQCAFIAFPDQEgAiAGTQ0BIAMgBS0AACIESQ0BAkACQCAEwEEASA0AIAVBAWohBQwBCyAEQcIBSQ0CAkAgBEHfAUsNACABIAVrQQJIDQMgBS0AASIHQcABcUGAAUcNAyAHQT9xIARBBnRBwA9xciADSw0DIAVBAmohBQwBCwJAIARB7wFLDQAgASAFa0EDSA0DIAUtAAIhCCAFLAABIQcCQAJAAkAgBEHtAUYNACAEQeABRw0BIAdBYHFBoH9GDQIMBgsgB0Ggf04NBQwBCyAHQb9/Sg0ECyAIQcABcUGAAUcNAyAHQT9xQQZ0IARBDHRBgOADcXIgCEE/cXIgA0sNAyAFQQNqIQUMAQsgBEH0AUsNAiABIAVrQQRIDQIgAiAGa0ECSQ0CIAUtAAMhCSAFLQACIQggBSwAASEHAkACQAJAAkAgBEGQfmoOBQACAgIBAgsgB0HwAGpB/wFxQTBPDQUMAgsgB0GQf04NBAwBCyAHQb9/Sg0DCyAIQcABcUGAAUcNAiAJQcABcUGAAUcNAiAHQT9xQQx0IARBEnRBgIDwAHFyIAhBBnRBwB9xciAJQT9xciADSw0CIAVBBGohBSAGQQFqIQYLIAZBAWohBgwACwALIAUgAGsLBABBBAsMACAAEIoFQQgQ0w0LVgEBfyMAQRBrIggkACAIIAI2AgwgCCAFNgIIIAIgAyAIQQxqIAUgBiAIQQhqQf//wwBBABC5CiECIAQgCCgCDDYCACAHIAgoAgg2AgAgCEEQaiQAIAILVgEBfyMAQRBrIggkACAIIAI2AgwgCCAFNgIIIAIgAyAIQQxqIAUgBiAIQQhqQf//wwBBABC7CiECIAQgCCgCDDYCACAHIAgoAgg2AgAgCEEQaiQAIAILCwAgBCACNgIAQQMLBABBAAsEAEEACxIAIAIgAyAEQf//wwBBABDACgsEAEEECwwAIAAQigVBCBDTDQtWAQF/IwBBEGsiCCQAIAggAjYCDCAIIAU2AgggAiADIAhBDGogBSAGIAhBCGpB///DAEEAEMwKIQIgBCAIKAIMNgIAIAcgCCgCCDYCACAIQRBqJAAgAguwBAAgAiAANgIAIAUgAzYCAAJAAkAgB0ECcUUNACAEIANrQQNIDQEgBSADQQFqNgIAIANB7wE6AAAgBSAFKAIAIgNBAWo2AgAgA0G7AToAACAFIAUoAgAiA0EBajYCACADQb8BOgAACyACKAIAIQMCQANAAkAgAyABSQ0AQQAhAAwCC0ECIQAgAygCACIDIAZLDQEgA0GAcHFBgLADRg0BAkACQCADQf8ASw0AQQEhACAEIAUoAgAiB2tBAUgNAyAFIAdBAWo2AgAgByADOgAADAELAkAgA0H/D0sNACAEIAUoAgAiAGtBAkgNBCAFIABBAWo2AgAgACADQQZ2QcABcjoAACAFIAUoAgAiAEEBajYCACAAIANBP3FBgAFyOgAADAELIAQgBSgCACIAayEHAkAgA0H//wNLDQAgB0EDSA0EIAUgAEEBajYCACAAIANBDHZB4AFyOgAAIAUgBSgCACIAQQFqNgIAIAAgA0EGdkE/cUGAAXI6AAAgBSAFKAIAIgBBAWo2AgAgACADQT9xQYABcjoAAAwBCyAHQQRIDQMgBSAAQQFqNgIAIAAgA0ESdkHwAXI6AAAgBSAFKAIAIgBBAWo2AgAgACADQQx2QT9xQYABcjoAACAFIAUoAgAiAEEBajYCACAAIANBBnZBP3FBgAFyOgAAIAUgBSgCACIAQQFqNgIAIAAgA0E/cUGAAXI6AAALIAIgAigCAEEEaiIDNgIADAALAAsgAA8LQQELVgEBfyMAQRBrIggkACAIIAI2AgwgCCAFNgIIIAIgAyAIQQxqIAUgBiAIQQhqQf//wwBBABDOCiECIAQgCCgCDDYCACAHIAgoAgg2AgAgCEEQaiQAIAIL+gQBBH8gAiAANgIAIAUgAzYCAAJAIAdBBHFFDQAgASACKAIAIgBrQQNIDQAgAC0AAEHvAUcNACAALQABQbsBRw0AIAAtAAJBvwFHDQAgAiAAQQNqNgIACwJAAkACQANAIAIoAgAiACABTw0BIAUoAgAiCCAETw0BIAAsAAAiB0H/AXEhAwJAAkAgB0EASA0AIAYgA0kNBUEBIQcMAQsgB0FCSQ0EAkAgB0FfSw0AAkAgASAAa0ECTg0AQQEPC0ECIQcgAC0AASIJQcABcUGAAUcNBEECIQcgCUE/cSADQQZ0QcAPcXIiAyAGTQ0BDAQLAkAgB0FvSw0AQQEhByABIABrIgpBAkgNBCAALAABIQkCQAJAAkAgA0HtAUYNACADQeABRw0BIAlBYHFBoH9GDQIMCAsgCUGgf0gNAQwHCyAJQb9/Sg0GCyAKQQJGDQQgAC0AAiIKQcABcUGAAUcNBUECIQcgCkE/cSAJQT9xQQZ0IANBDHRBgOADcXJyIgMgBksNBEEDIQcMAQsgB0F0Sw0EQQEhByABIABrIglBAkgNAyAALAABIQoCQAJAAkACQCADQZB+ag4FAAICAgECCyAKQfAAakH/AXFBME8NBwwCCyAKQZB/Tg0GDAELIApBv39KDQULIAlBAkYNAyAALQACIgtBwAFxQYABRw0EIAlBA0YNAyAALQADIglBwAFxQYABRw0EQQIhByAJQT9xIAtBBnRBwB9xIApBP3FBDHQgA0ESdEGAgPAAcXJyciIDIAZLDQNBBCEHCyAIIAM2AgAgAiAAIAdqNgIAIAUgBSgCAEEEajYCAAwACwALIAAgAUkhBwsgBw8LQQILCwAgBCACNgIAQQMLBABBAAsEAEEACxIAIAIgAyAEQf//wwBBABDTCgufBAEFfyAAIQUCQCABIABrQQNIDQAgACEFIARBBHFFDQAgACEFIAAtAABB7wFHDQAgACEFIAAtAAFBuwFHDQAgAEEDQQAgAC0AAkG/AUYbaiEFC0EAIQYCQANAIAUgAU8NASAGIAJPDQEgBSwAACIEQf8BcSEHAkACQCAEQQBIDQAgAyAHSQ0DQQEhBAwBCyAEQUJJDQICQCAEQV9LDQAgASAFa0ECSA0DIAUtAAEiBEHAAXFBgAFHDQMgBEE/cSAHQQZ0QcAPcXIgA0sNA0ECIQQMAQsCQCAEQW9LDQAgASAFa0EDSA0DIAUtAAIhCCAFLAABIQQCQAJAAkAgB0HtAUYNACAHQeABRw0BIARBYHFBoH9GDQIMBgsgBEGgf04NBQwBCyAEQb9/Sg0ECyAIQcABcUGAAUcNAyAEQT9xQQZ0IAdBDHRBgOADcXIgCEE/cXIgA0sNA0EDIQQMAQsgBEF0Sw0CIAEgBWtBBEgNAiAFLQADIQkgBS0AAiEIIAUsAAEhBAJAAkACQAJAIAdBkH5qDgUAAgICAQILIARB8ABqQf8BcUEwTw0FDAILIARBkH9ODQQMAQsgBEG/f0oNAwsgCEHAAXFBgAFHDQIgCUHAAXFBgAFHDQIgBEE/cUEMdCAHQRJ0QYCA8ABxciAIQQZ0QcAfcXIgCUE/cXIgA0sNAkEEIQQLIAZBAWohBiAFIARqIQUMAAsACyAFIABrCwQAQQQLDAAgABCKBUEIENMNC1YBAX8jAEEQayIIJAAgCCACNgIMIAggBTYCCCACIAMgCEEMaiAFIAYgCEEIakH//8MAQQAQzAohAiAEIAgoAgw2AgAgByAIKAIINgIAIAhBEGokACACC1YBAX8jAEEQayIIJAAgCCACNgIMIAggBTYCCCACIAMgCEEMaiAFIAYgCEEIakH//8MAQQAQzgohAiAEIAgoAgw2AgAgByAIKAIINgIAIAhBEGokACACCwsAIAQgAjYCAEEDCwQAQQALBABBAAsSACACIAMgBEH//8MAQQAQ0woLBABBBAsZACAAQcjLBDYCACAAQQxqEOcNGiAAEIoFCwwAIAAQ3QpBGBDTDQsZACAAQfDLBDYCACAAQRBqEOcNGiAAEIoFCwwAIAAQ3wpBHBDTDQsHACAALAAICwcAIAAoAggLBwAgACwACQsHACAAKAIMCw0AIAAgAUEMahC3BxoLDQAgACABQRBqELcHGgsMACAAQaWFBBCBBBoLDAAgAEGQzAQQ6QoaCzEBAX8jAEEQayICJAAgACACQQ9qIAJBDmoQlgUiACABIAEQ6goQ+A0gAkEQaiQAIAALBwAgABCPDQsMACAAQbiFBBCBBBoLDAAgAEGkzAQQ6QoaCwkAIAAgARDuCgsJACAAIAEQ7Q0LCQAgACABEJANCzIAAkBBAC0A7JwFRQ0AQQAoAuicBQ8LEPEKQQBBAToA7JwFQQBBgJ4FNgLonAVBgJ4FC8wBAAJAQQAtAKifBQ0AQcYAQQBBgIAEEO4EGkEAQQE6AKifBQtBgJ4FQcOABBDtChpBjJ4FQcqABBDtChpBmJ4FQaiABBDtChpBpJ4FQbCABBDtChpBsJ4FQZ+ABBDtChpBvJ4FQdGABBDtChpByJ4FQbqABBDtChpB1J4FQZKDBBDtChpB4J4FQbKDBBDtChpB7J4FQaqFBBDtChpB+J4FQZGGBBDtChpBhJ8FQYiBBBDtChpBkJ8FQdCDBBDtChpBnJ8FQcuBBBDtChoLHgEBf0GonwUhAQNAIAFBdGoQ5w0iAUGAngVHDQALCzIAAkBBAC0A9JwFRQ0AQQAoAvCcBQ8LEPQKQQBBAToA9JwFQQBBsJ8FNgLwnAVBsJ8FC8wBAAJAQQAtANigBQ0AQccAQQBBgIAEEO4EGkEAQQE6ANigBQtBsJ8FQZzvBBD2ChpBvJ8FQbjvBBD2ChpByJ8FQdTvBBD2ChpB1J8FQfTvBBD2ChpB4J8FQZzwBBD2ChpB7J8FQcDwBBD2ChpB+J8FQdzwBBD2ChpBhKAFQYDxBBD2ChpBkKAFQZDxBBD2ChpBnKAFQaDxBBD2ChpBqKAFQbDxBBD2ChpBtKAFQcDxBBD2ChpBwKAFQdDxBBD2ChpBzKAFQeDxBBD2ChoLHgEBf0HYoAUhAQNAIAFBdGoQ9Q0iAUGwnwVHDQALCwkAIAAgARCUCwsyAAJAQQAtAPycBUUNAEEAKAL4nAUPCxD4CkEAQQE6APycBUEAQeCgBTYC+JwFQeCgBQvEAgACQEEALQCAowUNAEHIAEEAQYCABBDuBBpBAEEBOgCAowULQeCgBUGSgAQQ7QoaQeygBUGJgAQQ7QoaQfigBUHqgwQQ7QoaQYShBUHKgwQQ7QoaQZChBUHYgAQQ7QoaQZyhBUG+hQQQ7QoaQaihBUGagAQQ7QoaQbShBUGMgQQQ7QoaQcChBUGfggQQ7QoaQcyhBUGOggQQ7QoaQdihBUGWggQQ7QoaQeShBUGpggQQ7QoaQfChBUG6gwQQ7QoaQfyhBUGohgQQ7QoaQYiiBUHQggQQ7QoaQZSiBUHYgQQQ7QoaQaCiBUHYgAQQ7QoaQayiBUGWgwQQ7QoaQbiiBUG+gwQQ7QoaQcSiBUHwgwQQ7QoaQdCiBUGCgwQQ7QoaQdyiBUHBgQQQ7QoaQeiiBUGEgQQQ7QoaQfSiBUGehgQQ7QoaCx4BAX9BgKMFIQEDQCABQXRqEOcNIgFB4KAFRw0ACwsyAAJAQQAtAISdBUUNAEEAKAKAnQUPCxD7CkEAQQE6AISdBUEAQZCjBTYCgJ0FQZCjBQvEAgACQEEALQCwpQUNAEHJAEEAQYCABBDuBBpBAEEBOgCwpQULQZCjBUHw8QQQ9goaQZyjBUGQ8gQQ9goaQaijBUG08gQQ9goaQbSjBUHM8gQQ9goaQcCjBUHk8gQQ9goaQcyjBUH08gQQ9goaQdijBUGI8wQQ9goaQeSjBUGc8wQQ9goaQfCjBUG48wQQ9goaQfyjBUHg8wQQ9goaQYikBUGA9AQQ9goaQZSkBUGk9AQQ9goaQaCkBUHI9AQQ9goaQaykBUHY9AQQ9goaQbikBUHo9AQQ9goaQcSkBUH49AQQ9goaQdCkBUHk8gQQ9goaQdykBUGI9QQQ9goaQeikBUGY9QQQ9goaQfSkBUGo9QQQ9goaQYClBUG49QQQ9goaQYylBUHI9QQQ9goaQZilBUHY9QQQ9goaQaSlBUHo9QQQ9goaCx4BAX9BsKUFIQEDQCABQXRqEPUNIgFBkKMFRw0ACwsyAAJAQQAtAIydBUUNAEEAKAKInQUPCxD+CkEAQQE6AIydBUEAQcClBTYCiJ0FQcClBQs8AAJAQQAtANilBQ0AQcoAQQBBgIAEEO4EGkEAQQE6ANilBQtBwKUFQYSHBBDtChpBzKUFQYGHBBDtChoLHgEBf0HYpQUhAQNAIAFBdGoQ5w0iAUHApQVHDQALCzIAAkBBAC0AlJ0FRQ0AQQAoApCdBQ8LEIELQQBBAToAlJ0FQQBB4KUFNgKQnQVB4KUFCzwAAkBBAC0A+KUFDQBBywBBAEGAgAQQ7gQaQQBBAToA+KUFC0HgpQVB+PUEEPYKGkHspQVBhPYEEPYKGgseAQF/QfilBSEBA0AgAUF0ahD1DSIBQeClBUcNAAsLKAACQEEALQCVnQUNAEHMAEEAQYCABBDuBBpBAEEBOgCVnQULQbSQBQsKAEG0kAUQ5w0aCzQAAkBBAC0ApJ0FDQBBmJ0FQbzMBBDpChpBzQBBAEGAgAQQ7gQaQQBBAToApJ0FC0GYnQULCgBBmJ0FEPUNGgsoAAJAQQAtAKWdBQ0AQc4AQQBBgIAEEO4EGkEAQQE6AKWdBQtBwJAFCwoAQcCQBRDnDRoLNAACQEEALQC0nQUNAEGonQVB4MwEEOkKGkHPAEEAQYCABBDuBBpBAEEBOgC0nQULQaidBQsKAEGonQUQ9Q0aCzQAAkBBAC0AxJ0FDQBBuJ0FQdmGBBCBBBpB0ABBAEGAgAQQ7gQaQQBBAToAxJ0FC0G4nQULCgBBuJ0FEOcNGgs0AAJAQQAtANSdBQ0AQcidBUGEzQQQ6QoaQdEAQQBBgIAEEO4EGkEAQQE6ANSdBQtByJ0FCwoAQcidBRD1DRoLNAACQEEALQDknQUNAEHYnQVBhoMEEIEEGkHSAEEAQYCABBDuBBpBAEEBOgDknQULQdidBQsKAEHYnQUQ5w0aCzQAAkBBAC0A9J0FDQBB6J0FQdjNBBDpChpB0wBBAEGAgAQQ7gQaQQBBAToA9J0FC0HonQULCgBB6J0FEPUNGgsaAAJAIAAoAgAQzAVGDQAgACgCABD2BAsgAAsJACAAIAEQ+w0LDAAgABCKBUEIENMNCwwAIAAQigVBCBDTDQsMACAAEIoFQQgQ0w0LDAAgABCKBUEIENMNCxAAIABBCGoQmgsaIAAQigULBAAgAAsMACAAEJkLQQwQ0w0LEAAgAEEIahCdCxogABCKBQsEACAACwwAIAAQnAtBDBDTDQsMACAAEKALQQwQ0w0LEAAgAEEIahCTCxogABCKBQsMACAAEKILQQwQ0w0LEAAgAEEIahCTCxogABCKBQsMACAAEIoFQQgQ0w0LDAAgABCKBUEIENMNCwwAIAAQigVBCBDTDQsMACAAEIoFQQgQ0w0LDAAgABCKBUEIENMNCwwAIAAQigVBCBDTDQsMACAAEIoFQQgQ0w0LDAAgABCKBUEIENMNCwwAIAAQigVBCBDTDQsMACAAEIoFQQgQ0w0LCQAgACABEK8LC78BAQJ/IwBBEGsiBCQAAkAgAyAAEOADSw0AAkACQCADEOEDRQ0AIAAgAxDNAyAAEMcDIQUMAQsgBEEIaiAAENUCIAMQ4gNBAWoQ4wMgBCgCCCIFIAQoAgwQ5AMgACAFEOUDIAAgBCgCDBDmAyAAIAMQ5wMLAkADQCABIAJGDQEgBSABEM4DIAVBAWohBSABQQFqIQEMAAsACyAEQQA6AAcgBSAEQQdqEM4DIAAgAxDBAiAEQRBqJAAPCyAAEOgDAAsHACABIABrCwQAIAALBwAgABC0CwsJACAAIAEQtgsLvwEBAn8jAEEQayIEJAACQCADIAAQtwtLDQACQAJAIAMQuAtFDQAgACADEJoIIAAQmQghBQwBCyAEQQhqIAAQogggAxC5C0EBahC6CyAEKAIIIgUgBCgCDBC7CyAAIAUQvAsgACAEKAIMEL0LIAAgAxCYCAsCQANAIAEgAkYNASAFIAEQlwggBUEEaiEFIAFBBGohAQwACwALIARBADYCBCAFIARBBGoQlwggACADEKgHIARBEGokAA8LIAAQvgsACwcAIAAQtQsLBAAgAAsKACABIABrQQJ1CxkAIAAQuwcQvwsiACAAEOoDQQF2S3ZBeGoLBwAgAEECSQstAQF/QQEhAQJAIABBAkkNACAAQQFqEMMLIgAgAEF/aiIAIABBAkYbIQELIAELGQAgASACEMELIQEgACACNgIEIAAgATYCAAsCAAsMACAAEL8HIAE2AgALOgEBfyAAEL8HIgIgAigCCEGAgICAeHEgAUH/////B3FyNgIIIAAQvwciACAAKAIIQYCAgIB4cjYCCAsKAEGPhAQQ6wMACwgAEOoDQQJ2CwQAIAALHQACQCABIAAQvwtNDQAQ7wMACyABQQJ0QQQQ8AMLBwAgABDHCwsKACAAQQFqQX5xCwcAIAAQxQsLBAAgAAsEACAACwQAIAALEgAgACAAEM4CEM8CIAEQyQsaC1sBAn8jAEEQayIDJAACQCACIAAQ3wIiBE0NACAAIAIgBGsQ2wILIAAgAhDeByADQQA6AA8gASACaiADQQ9qEM4DAkAgAiAETw0AIAAgBBDdAgsgA0EQaiQAIAALhQIBA38jAEEQayIHJAACQCACIAAQ4AMiCCABa0sNACAAEM4CIQkCQCABIAhBAXZBeGpPDQAgByABQQF0NgIMIAcgAiABajYCBCAHQQRqIAdBDGoQhgQoAgAQ4gNBAWohCAsgABDTAiAHQQRqIAAQ1QIgCBDjAyAHKAIEIgggBygCCBDkAwJAIARFDQAgCBDPAiAJEM8CIAQQ9wEaCwJAIAMgBSAEaiICRg0AIAgQzwIgBGogBmogCRDPAiAEaiAFaiADIAJrEPcBGgsCQCABQQFqIgFBC0YNACAAENUCIAkgARDLAwsgACAIEOUDIAAgBygCCBDmAyAHQRBqJAAPCyAAEOgDAAsCAAsLACAAIAEgAhDNCwsOACABIAJBAnRBBBDSAwsRACAAEL4HKAIIQf////8HcQsEACAACwsAIAAgASACELcECwsAIAAgASACELcECwsAIAAgASACEIEFCwsAIAAgASACEIEFCwsAIAAgATYCACAACwsAIAAgATYCACAAC2EBAX8jAEEQayICJAAgAiAANgIMAkAgACABRg0AA0AgAiABQX9qIgE2AgggACABTw0BIAJBDGogAkEIahDXCyACIAIoAgxBAWoiADYCDCACKAIIIQEMAAsACyACQRBqJAALDwAgACgCACABKAIAENgLCwkAIAAgARCDBwthAQF/IwBBEGsiAiQAIAIgADYCDAJAIAAgAUYNAANAIAIgAUF8aiIBNgIIIAAgAU8NASACQQxqIAJBCGoQ2gsgAiACKAIMQQRqIgA2AgwgAigCCCEBDAALAAsgAkEQaiQACw8AIAAoAgAgASgCABDbCwsJACAAIAEQ3AsLHAEBfyAAKAIAIQIgACABKAIANgIAIAEgAjYCAAsKACAAEL4HEN4LCwQAIAALDQAgACABIAIgAxDgCwtpAQF/IwBBIGsiBCQAIARBGGogASACEOELIARBEGogBEEMaiAEKAIYIAQoAhwgAxDiCxDjCyAEIAEgBCgCEBDkCzYCDCAEIAMgBCgCFBDlCzYCCCAAIARBDGogBEEIahDmCyAEQSBqJAALCwAgACABIAIQ5wsLBwAgABDoCwtrAQF/IwBBEGsiBSQAIAUgAjYCCCAFIAQ2AgwCQANAIAIgA0YNASACLAAAIQQgBUEMahCpAiAEEKoCGiAFIAJBAWoiAjYCCCAFQQxqEKsCGgwACwALIAAgBUEIaiAFQQxqEOYLIAVBEGokAAsJACAAIAEQ6gsLCQAgACABEOsLCwwAIAAgASACEOkLGgs4AQF/IwBBEGsiAyQAIAMgARCUAzYCDCADIAIQlAM2AgggACADQQxqIANBCGoQ7AsaIANBEGokAAsEACAACxgAIAAgASgCADYCACAAIAIoAgA2AgQgAAsJACAAIAEQlwMLBAAgAQsYACAAIAEoAgA2AgAgACACKAIANgIEIAALDQAgACABIAIgAxDuCwtpAQF/IwBBIGsiBCQAIARBGGogASACEO8LIARBEGogBEEMaiAEKAIYIAQoAhwgAxDwCxDxCyAEIAEgBCgCEBDyCzYCDCAEIAMgBCgCFBDzCzYCCCAAIARBDGogBEEIahD0CyAEQSBqJAALCwAgACABIAIQ9QsLBwAgABD2CwtrAQF/IwBBEGsiBSQAIAUgAjYCCCAFIAQ2AgwCQANAIAIgA0YNASACKAIAIQQgBUEMahC7AiAEELwCGiAFIAJBBGoiAjYCCCAFQQxqEL0CGgwACwALIAAgBUEIaiAFQQxqEPQLIAVBEGokAAsJACAAIAEQ+AsLCQAgACABEPkLCwwAIAAgASACEPcLGgs4AQF/IwBBEGsiAyQAIAMgARCtAzYCDCADIAIQrQM2AgggACADQQxqIANBCGoQ+gsaIANBEGokAAsEACAACxgAIAAgASgCADYCACAAIAIoAgA2AgQgAAsJACAAIAEQsAMLBAAgAQsYACAAIAEoAgA2AgAgACACKAIANgIEIAALFQAgAEIANwIAIABBCGpBADYCACAACwQAIAALBAAgAAtaAQF/IwBBEGsiAyQAIAMgATYCCCADIAA2AgwgAyACNgIEQQAhAQJAIANBA2ogA0EEaiADQQxqEP8LDQAgA0ECaiADQQRqIANBCGoQ/wshAQsgA0EQaiQAIAELDQAgASgCACACKAIASQsHACAAEIMMCw4AIAAgAiABIABrEIIMCwwAIAAgASACEL8ERQsnAQF/IwBBEGsiASQAIAEgADYCDCABQQxqEIQMIQAgAUEQaiQAIAALBwAgABCFDAsKACAAKAIAEIYMCyoBAX8jAEEQayIBJAAgASAANgIMIAFBDGoQ9AcQzwIhACABQRBqJAAgAAsRACAAIAAoAgAgAWo2AgAgAAuQAgEDfyMAQRBrIgckAAJAIAIgABC3CyIIIAFrSw0AIAAQrQYhCQJAIAEgCEEBdkF4ak8NACAHIAFBAXQ2AgwgByACIAFqNgIEIAdBBGogB0EMahCGBCgCABC5C0EBaiEICyAAEMsLIAdBBGogABCiCCAIELoLIAcoAgQiCCAHKAIIELsLAkAgBEUNACAIEL8DIAkQvwMgBBCtAhoLAkAgAyAFIARqIgJGDQAgCBC/AyAEQQJ0IgRqIAZBAnRqIAkQvwMgBGogBUECdGogAyACaxCtAhoLAkAgAUEBaiIBQQJGDQAgABCiCCAJIAEQzAsLIAAgCBC8CyAAIAcoAggQvQsgB0EQaiQADwsgABC+CwALCgAgASAAa0ECdQtaAQF/IwBBEGsiAyQAIAMgATYCCCADIAA2AgwgAyACNgIEQQAhAQJAIANBA2ogA0EEaiADQQxqEI0MDQAgA0ECaiADQQRqIANBCGoQjQwhAQsgA0EQaiQAIAELDAAgABCwCyACEI4MCxIAIAAgASACIAEgAhCdCBCPDAsNACABKAIAIAIoAgBJCwQAIAALvwEBAn8jAEEQayIEJAACQCADIAAQtwtLDQACQAJAIAMQuAtFDQAgACADEJoIIAAQmQghBQwBCyAEQQhqIAAQogggAxC5C0EBahC6CyAEKAIIIgUgBCgCDBC7CyAAIAUQvAsgACAEKAIMEL0LIAAgAxCYCAsCQANAIAEgAkYNASAFIAEQlwggBUEEaiEFIAFBBGohAQwACwALIARBADYCBCAFIARBBGoQlwggACADEKgHIARBEGokAA8LIAAQvgsACwcAIAAQkwwLEQAgACACIAEgAGtBAnUQkgwLDwAgACABIAJBAnQQvwRFCycBAX8jAEEQayIBJAAgASAANgIMIAFBDGoQlAwhACABQRBqJAAgAAsHACAAEJUMCwoAIAAoAgAQlgwLKgEBfyMAQRBrIgEkACABIAA2AgwgAUEMahC4CBC/AyEAIAFBEGokACAACxQAIAAgACgCACABQQJ0ajYCACAACwkAIAAgARCZDAsOACABEKIIGiAAEKIIGgsNACAAIAEgAiADEJsMC2kBAX8jAEEgayIEJAAgBEEYaiABIAIQnAwgBEEQaiAEQQxqIAQoAhggBCgCHCADEJQDEJUDIAQgASAEKAIQEJ0MNgIMIAQgAyAEKAIUEJcDNgIIIAAgBEEMaiAEQQhqEJ4MIARBIGokAAsLACAAIAEgAhCfDAsJACAAIAEQoQwLDAAgACABIAIQoAwaCzgBAX8jAEEQayIDJAAgAyABEKIMNgIMIAMgAhCiDDYCCCAAIANBDGogA0EIahCgAxogA0EQaiQACxgAIAAgASgCADYCACAAIAIoAgA2AgQgAAsJACAAIAEQpwwLBwAgABCjDAsnAQF/IwBBEGsiASQAIAEgADYCDCABQQxqEKQMIQAgAUEQaiQAIAALBwAgABClDAsKACAAKAIAEKYMCyoBAX8jAEEQayIBJAAgASAANgIMIAFBDGoQ9gcQogMhACABQRBqJAAgAAsJACAAIAEQqAwLMgEBfyMAQRBrIgIkACACIAA2AgwgAkEMaiABIAJBDGoQpAxrEMkIIQAgAkEQaiQAIAALCwAgACABNgIAIAALDQAgACABIAIgAxCrDAtpAQF/IwBBIGsiBCQAIARBGGogASACEKwMIARBEGogBEEMaiAEKAIYIAQoAhwgAxCtAxCuAyAEIAEgBCgCEBCtDDYCDCAEIAMgBCgCFBCwAzYCCCAAIARBDGogBEEIahCuDCAEQSBqJAALCwAgACABIAIQrwwLCQAgACABELEMCwwAIAAgASACELAMGgs4AQF/IwBBEGsiAyQAIAMgARCyDDYCDCADIAIQsgw2AgggACADQQxqIANBCGoQuQMaIANBEGokAAsYACAAIAEoAgA2AgAgACACKAIANgIEIAALCQAgACABELcMCwcAIAAQswwLJwEBfyMAQRBrIgEkACABIAA2AgwgAUEMahC0DCEAIAFBEGokACAACwcAIAAQtQwLCgAgACgCABC2DAsqAQF/IwBBEGsiASQAIAEgADYCDCABQQxqELoIELsDIQAgAUEQaiQAIAALCQAgACABELgMCzUBAX8jAEEQayICJAAgAiAANgIMIAJBDGogASACQQxqELQMa0ECdRDYCCEAIAJBEGokACAACwsAIAAgATYCACAACwsAIABBADYCACAACwcAIAAQxwwLCwAgAEEAOgAAIAALPQEBfyMAQRBrIgEkACABIAAQyAwQyQw2AgwgARChAjYCCCABQQxqIAFBCGoQ+AIoAgAhACABQRBqJAAgAAsKAEHcgQQQ6wMACwoAIABBCGoQywwLGwAgASACQQAQygwhASAAIAI2AgQgACABNgIACwoAIABBCGoQzAwLAgALJAAgACABNgIAIAAgASgCBCIBNgIEIAAgASACQQJ0ajYCCCAACxEAIAAoAgAgACgCBDYCBCAACwQAIAALCAAgARDWDBoLCwAgAEEAOgB4IAALCgAgAEEIahDODAsHACAAEM0MC0UBAX8jAEEQayIDJAACQAJAIAFBHksNACAALQB4QQFxDQAgAEEBOgB4DAELIANBD2oQ0AwgARDRDCEACyADQRBqJAAgAAsKACAAQQRqENQMCwcAIAAQ1QwLCABB/////wMLCgAgAEEEahDPDAsEACAACwcAIAAQ0gwLHQACQCABIAAQ0wxNDQAQ7wMACyABQQJ0QQQQ8AMLBAAgAAsIABDqA0ECdgsEACAACwQAIAALBwAgABDXDAsLACAAQQA2AgAgAAs0AQF/IAAoAgQhAgJAA0AgASACRg0BIAAQvwwgAkF8aiICEMUMENkMDAALAAsgACABNgIECwcAIAEQ2gwLAgALEwAgABDdDCgCACAAKAIAa0ECdQthAQJ/IwBBEGsiAiQAIAIgATYCDAJAIAEgABC9DCIDSw0AAkAgABDbDCIBIANBAXZPDQAgAiABQQF0NgIIIAJBCGogAkEMahCGBCgCACEDCyACQRBqJAAgAw8LIAAQvgwACwoAIABBCGoQ4AwLAgALCwAgACABIAIQ4gwLBwAgABDhDAsEACAACzkBAX8jAEEQayIDJAACQAJAIAEgAEcNACAAQQA6AHgMAQsgA0EPahDQDCABIAIQ4wwLIANBEGokAAsOACABIAJBAnRBBBDSAwuLAQECfyMAQRBrIgQkAEEAIQUgBEEANgIMIABBDGogBEEMaiADEOgMGgJAAkAgAQ0AQQAhAQwBCyAEQQRqIAAQ6QwgARDADCAEKAIIIQEgBCgCBCEFCyAAIAU2AgAgACAFIAJBAnRqIgM2AgggACADNgIEIAAQ6gwgBSABQQJ0ajYCACAEQRBqJAAgAAtiAQJ/IwBBEGsiAiQAIAJBBGogAEEIaiABEOsMIgEoAgAhAwJAA0AgAyABKAIERg0BIAAQ6QwgASgCABDFDBDGDCABIAEoAgBBBGoiAzYCAAwACwALIAEQ7AwaIAJBEGokAAuoAQEFfyMAQRBrIgIkACAAEN4MIAAQvwwhAyACQQhqIAAoAgQQ7QwhBCACQQRqIAAoAgAQ7QwhBSACIAEoAgQQ7QwhBiACIAMgBCgCACAFKAIAIAYoAgAQ7gw2AgwgASACQQxqEO8MNgIEIAAgAUEEahDwDCAAQQRqIAFBCGoQ8AwgABDBDCABEOoMEPAMIAEgASgCBDYCACAAIAAQsQkQwgwgAkEQaiQACyYAIAAQ8QwCQCAAKAIARQ0AIAAQ6QwgACgCACAAEPIMEN8MCyAACxYAIAAgARC6DCIBQQRqIAIQ8wwaIAELCgAgAEEMahD0DAsKACAAQQxqEPUMCygBAX8gASgCACEDIAAgATYCCCAAIAM2AgAgACADIAJBAnRqNgIEIAALEQAgACgCCCAAKAIANgIAIAALCwAgACABNgIAIAALCwAgASACIAMQ9wwLBwAgACgCAAscAQF/IAAoAgAhAiAAIAEoAgA2AgAgASACNgIACwwAIAAgACgCBBCLDQsTACAAEIwNKAIAIAAoAgBrQQJ1CwsAIAAgATYCACAACwoAIABBBGoQ9gwLBwAgABDVDAsHACAAKAIACysBAX8jAEEQayIDJAAgA0EIaiAAIAEgAhD4DCADKAIMIQIgA0EQaiQAIAILDQAgACABIAIgAxD5DAsNACAAIAEgAiADEPoMC2kBAX8jAEEgayIEJAAgBEEYaiABIAIQ+wwgBEEQaiAEQQxqIAQoAhggBCgCHCADEPwMEP0MIAQgASAEKAIQEP4MNgIMIAQgAyAEKAIUEP8MNgIIIAAgBEEMaiAEQQhqEIANIARBIGokAAsLACAAIAEgAhCBDQsHACAAEIYNC30BAX8jAEEQayIFJAAgBSADNgIIIAUgAjYCDCAFIAQ2AgQCQANAIAVBDGogBUEIahCCDUUNASAFQQxqEIMNKAIAIQMgBUEEahCEDSADNgIAIAVBDGoQhQ0aIAVBBGoQhQ0aDAALAAsgACAFQQxqIAVBBGoQgA0gBUEQaiQACwkAIAAgARCIDQsJACAAIAEQiQ0LDAAgACABIAIQhw0aCzgBAX8jAEEQayIDJAAgAyABEPwMNgIMIAMgAhD8DDYCCCAAIANBDGogA0EIahCHDRogA0EQaiQACw0AIAAQ7wwgARDvDEcLCgAQig0gABCEDQsKACAAKAIAQXxqCxEAIAAgACgCAEF8ajYCACAACwQAIAALGAAgACABKAIANgIAIAAgAigCADYCBCAACwkAIAAgARD/DAsEACABCwIACwkAIAAgARCNDQsKACAAQQxqEI4NCzcBAn8CQANAIAEgACgCCEYNASAAEOkMIQIgACAAKAIIQXxqIgM2AgggAiADEMUMENkMDAALAAsLBwAgABDhDAsHACAAEPcEC2EBAX8jAEEQayICJAAgAiAANgIMAkAgACABRg0AA0AgAiABQXxqIgE2AgggACABTw0BIAJBDGogAkEIahCRDSACIAIoAgxBBGoiADYCDCACKAIIIQEMAAsACyACQRBqJAALDwAgACgCACABKAIAEJINCwkAIAAgARDRAgsEACAACwQAIAALBAAgAAsEACAACwQAIAALDQAgAEGY9gQ2AgAgAAsNACAAQbz2BDYCACAACwwAIAAQzAU2AgAgAAsEACAACw4AIAAgASgCADYCACAACwgAIAAQ4QkaCwQAIAALCQAgACABEKENCwcAIAAQog0LCwAgACABNgIAIAALDQAgACgCABCjDRCkDQsHACAAEKYNCwcAIAAQpQ0LDQAgACgCABCnDTYCBAsHACAAKAIACxkBAX9BAEEAKAKUnAVBAWoiADYClJwFIAALFgAgACABEKsNIgFBBGogAhCOBBogAQsHACAAEKwNCwoAIABBBGoQjwQLDgAgACABKAIANgIAIAALBAAgAAteAQJ/IwBBEGsiAyQAAkAgAiAAENgFIgRNDQAgACACIARrEKAICyAAIAIQoQggA0EANgIMIAEgAkECdGogA0EMahCXCAJAIAIgBE8NACAAIAQQmwgLIANBEGokACAACwoAIAEgAGtBDG0LCwAgACABIAIQ5gQLBQAQsQ0LCABBgICAgHgLBQAQtA0LBQAQtQ0LDQBCgICAgICAgICAfwsNAEL///////////8ACwsAIAAgASACEOMECwUAELgNCwYAQf//AwsFABC6DQsEAEJ/CwwAIAAgARDMBRCGBQsMACAAIAEQzAUQhwULPQIBfwF+IwBBEGsiAyQAIAMgASACEMwFEIgFIAMpAwAhBCAAIANBCGopAwA3AwggACAENwMAIANBEGokAAsKACABIABrQQxtCw4AIAAgASgCADYCACAACwQAIAALBAAgAAsOACAAIAEoAgA2AgAgAAsHACAAEMUNCwoAIABBBGoQjwQLBAAgAAsEACAACw4AIAAgASgCADYCACAACwQAIAALBAAgAAsFABDuCQsEACAACwMAAAtFAQJ/IwBBEGsiAiQAQQAhAwJAIABBA3ENACABIABwDQAgAkEMaiAAIAEQuwEhAEEAIAIoAgwgABshAwsgAkEQaiQAIAMLEwACQCAAEM8NIgANABDQDQsgAAsxAQJ/IABBASAAQQFLGyEBAkADQCABELUBIgINARCKDiIARQ0BIAAR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AFN1bmRheQBNb25kYXkARnJpZGF5AE1heQAlbS8lZC8leQAtKyAgIDBYMHgALTBYKzBYIDBYLTB4KzB4IDB4AHcATm92AFRodQBBdWd1c3QAdW5zaWduZWQgc2hvcnQAZnJhbWVjb3VudAB1bnNpZ25lZCBpbnQAaGVpZ2h0AE9jdABmbG9hdABTYXQAdWludDY0X3QAQXByAHZlY3RvcgBtb25leV9nZXQgZXJyb3IAZ2V0X21hcF9idWZmZXIAU1BMVkRlY29kZXIAT2N0b2JlcgBOb3ZlbWJlcgBTZXB0ZW1iZXIARGVjZW1iZXIAdW5zaWduZWQgY2hhcgBpb3NfYmFzZTo6Y2xlYXIATWFyAHN5c3RlbS9saWIvbGliY3h4YWJpL3NyYy9wcml2YXRlX3R5cGVpbmZvLmNwcABTZXAAJUk6JU06JVMgJXAAU3VuAEp1bgBzdGQ6OmV4Y2VwdGlvbgBkdXJhdGlvbgBNb24AbmFuAEphbgBKdWwAYm9vbABsbABBcHJpbABGcmkAZGVwdGgAd2lkdGgAY2FuX2NhdGNoAE1hcmNoAEF1ZwB1bnNpZ25lZCBsb25nAHN0ZDo6d3N0cmluZwBiYXNpY19zdHJpbmcAc3RkOjpzdHJpbmcAc3RkOjp1MTZzdHJpbmcAc3RkOjp1MzJzdHJpbmcAaW5mACUuMExmACVMZgBmcmFtZWNvdW50IG11c3QgYmUgcG9zaXRpdmUAZHVyYXRpb24gbXVzdCBiZSBwb3NpdGl2ZQBmcmFtZXJhdGUgbXVzdCBiZSBwb3NpdGl2ZQB0cnVlAFR1ZQBmcmFtZXJhdGUAZmFsc2UASnVuZQBvdXQtb2YtcmFuZ2UgZnJhbWUAZG91YmxlACUwKmxsZAAlKmxsZAArJWxsZAAlKy40bGQAdm9pZABsb2NhbGUgbm90IHN1cHBvcnRlZABXZWQAJVktJW0tJWQARGVjAHdiAHJiAEZlYgBhYgB3K2IAcitiAGErYgByd2EAZ2V0X21ldGFkYXRhAFNQTFZNZXRhZGF0YQAlYSAlYiAlZCAlSDolTTolUyAlWQBQT1NJWAAlSDolTTolUwBOQU4AUE0AQU0AJUg6JU0ATENfQUxMAEFTQ0lJAExBTkcASU5GAGRpbWVuc2lvbnMgbXVzdCBiZSBhIG11bHRpcGxlIG9mIEJSSUNLX1NJWkUAQwBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgc2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgaW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxmbG9hdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDY0X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDY0X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBjaGFyPgBzdGQ6OmJhc2ljX3N0cmluZzx1bnNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPgAwMTIzNDU2Nzg5AEMuVVRGLTgALgAtAHcrAHIrAGErAChudWxsKQAlAGFkanVzdGVkUHRyICYmICJjYXRjaGluZyBhIGNsYXNzIHdpdGhvdXQgYW4gb2JqZWN0PyIAUHVyZSB2aXJ0dWFsIGZ1bmN0aW9uIGNhbGxlZCEAbGliYysrYWJpOiAACgAJAJBGAQAIBwEATlN0M19fMjEyYmFzaWNfc3RyaW5nSWhOU18xMWNoYXJfdHJhaXRzSWhFRU5TXzlhbGxvY2F0b3JJaEVFRUUAAJBGAQBQBwEATlN0M19fMjEyYmFzaWNfc3RyaW5nSXdOU18xMWNoYXJfdHJhaXRzSXdFRU5TXzlhbGxvY2F0b3JJd0VFRUUAAJBGAQCYBwEATlN0M19fMjEyYmFzaWNfc3RyaW5nSURzTlNfMTFjaGFyX3RyYWl0c0lEc0VFTlNfOWFsbG9jYXRvcklEc0VFRUUAAACQRgEA5AcBAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0lEaU5TXzExY2hhcl90cmFpdHNJRGlFRU5TXzlhbGxvY2F0b3JJRGlFRUVFAAAAkEYBADAIAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ljRUUAAJBGAQBYCAEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJYUVFAACQRgEAgAgBAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXNFRQAAkEYBAKgIAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0l0RUUAAJBGAQDQCAEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJaUVFAACQRgEA+AgBAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWpFRQAAkEYBACAJAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lsRUUAAJBGAQBICQEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJbUVFAACQRgEAcAkBAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXhFRQAAkEYBAJgJAQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0l5RUUAAJBGAQDACQEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZkVFAACQRgEA6AkBAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWRFRQAAkEYBABAKAQAxMlNQTFZNZXRhZGF0YQBwAHZwAGlwcAB2cHBpAGZwcAB2cHBmAAAAkEYBAEAKAQAxMVNQTFZEZWNvZGVyAAAAcEcBAGAKAQAAAAAAOAoBAFAxMVNQTFZEZWNvZGVyAABwRwEAgAoBAAEAAAA4CgEAUEsxMVNQTFZEZWNvZGVyAHBwAHYAAAAAUAoBAKAKAQCQRgEAqAoBAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0ljTlNfMTFjaGFyX3RyYWl0c0ljRUVOU185YWxsb2NhdG9ySWNFRUVFAHBwcAAACAoBAFAKAQAACwEAUAoBADRGAQCQRgEACAsBAE4xMGVtc2NyaXB0ZW4zdmFsRQBwcHBpAJBGAQAoCwEATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJaEVFAAAAAAAAQAwBABgAAAAZAAAAGgAAABsAAAAcAAAAHQAAAB4AAAAfAAAAIAAAACEAAAAiAAAAIwAAACQAAAAlAAAACAAAAAAAAAB8DAEAJgAAACcAAAD4////+P///3wMAQAoAAAAKQAAAJQLAQCoCwEAAAAAAGANAQAqAAAAKwAAACwAAAAtAAAALgAAAC8AAAAwAAAAHwAAACAAAAAxAAAAIgAAADIAAAAkAAAAMwAAAAAAAAAIDAEANAAAADUAAAC4RgEAFAwBAKwNAQBOU3QzX18yOWJhc2ljX2lvc0ljTlNfMTFjaGFyX3RyYWl0c0ljRUVFRQAAAJBGAQBIDAEATlN0M19fMjE1YmFzaWNfc3RyZWFtYnVmSWNOU18xMWNoYXJfdHJhaXRzSWNFRUVFAAAAABRHAQCUDAEAAAAAAAEAAAAIDAEAA/T//05TdDNfXzIxM2Jhc2ljX2lzdHJlYW1JY05TXzExY2hhcl90cmFpdHNJY0VFRUUAAGwAAAAAAAAAJA0BADYAAAA3AAAAlP///5T///8kDQEAOAAAADkAAADQDAEACA0BABwNAQDkDAEAbAAAAAAAAAB8DAEAJgAAACcAAACU////lP///3wMAQAoAAAAKQAAALhGAQAwDQEAfAwBAE5TdDNfXzIxNGJhc2ljX2lmc3RyZWFtSWNOU18xMWNoYXJfdHJhaXRzSWNFRUVFALhGAQBsDQEAQAwBAE5TdDNfXzIxM2Jhc2ljX2ZpbGVidWZJY05TXzExY2hhcl90cmFpdHNJY0VFRUUAAAAAAACsDQEAOgAAADsAAACQRgEAtA0BAE5TdDNfXzI4aW9zX2Jhc2VFAAAAAAAAAAAAAADRdJ4AV529KoBwUg///z4nCgAAAGQAAADoAwAAECcAAKCGAQBAQg8AgJaYAADh9QUYAAAANQAAAHEAAABr////zvv//5K///8AAAAAAAAAAP////////////////////////////////////////////////////////////////8AAQIDBAUGBwgJ/////////woLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIj////////CgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiP/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AAECBAcDBgUAAAAAAAAAAgAAwAMAAMAEAADABQAAwAYAAMAHAADACAAAwAkAAMAKAADACwAAwAwAAMANAADADgAAwA8AAMAQAADAEQAAwBIAAMATAADAFAAAwBUAAMAWAADAFwAAwBgAAMAZAADAGgAAwBsAAMAcAADAHQAAwB4AAMAfAADAAAAAswEAAMMCAADDAwAAwwQAAMMFAADDBgAAwwcAAMMIAADDCQAAwwoAAMMLAADDDAAAww0AANMOAADDDwAAwwAADLsBAAzDAgAMwwMADMMEAAzbAAAAAN4SBJUAAAAA////////////////ABABABQAAABDLlVURi04AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFBABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMQ19DVFlQRQAAAABMQ19OVU1FUklDAABMQ19USU1FAAAAAABMQ19DT0xMQVRFAABMQ19NT05FVEFSWQBMQ19NRVNTQUdFUwAAAAAAAAAAABkACwAZGRkAAAAABQAAAAAAAAkAAAAACwAAAAAAAAAAGQAKChkZGQMKBwABAAkLGAAACQYLAAALAAYZAAAAGRkZAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAABkACw0ZGRkADQAAAgAJDgAAAAkADgAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAATAAAAABMAAAAACQwAAAAAAAwAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAADwAAAAQPAAAAAAkQAAAAAAAQAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAAAAAAAAAAAAAABEAAAAAEQAAAAAJ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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUBwBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAAAwAAAAQA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AAAyAAAAMgAAADIAAAAyAAAAggAAAIIAAACCAAAAggAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8KgEAYQAAAGIAAABWAAAAYwAAAGQAAABlAAAAZgAAAGcAAABoAAAAaQAAAAAAAAAYKwEAagAAAGsAAABWAAAAbAAAAG0AAABuAAAAbwAAAHAAAAAAAAAAPCsBAHEAAAByAAAAVgAAAHMAAAB0AAAAdQAAAHYAAAB3AAAAdAAAAHIAAAB1AAAAZQAAAAAAAABmAAAAYQAAAGwAAABzAAAAZQAAAAAAAAAlAAAAbQAAAC8AAAAlAAAAZAAAAC8AAAAlAAAAeQAAAAAAAAAlAAAASAAAADoAAAAlAAAATQAAADoAAAAlAAAAUwAAAAAAAAAlAAAAYQAAACAAAAAlAAAAYgAAACAAAAAlAAAAZAAAACAAAAAlAAAASAAAADoAAAAlAAAATQAAADoAAAAlAAAAUwAAACAAAAAlAAAAWQAAAAAAAAAlAAAASQAAADoAAAAlAAAATQAAADoA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dCBwZXJtaXR0ZWQATm8gc3VjaCBmaWxlIG9yIGRpcmVjdG9yeQBObyBzdWNoIHByb2Nlc3MARmlsZSBleGlzdHMAVmFsdWUgdG9vIGxhcmdlIGZvciBkYXRhIHR5cGUATm8gc3BhY2UgbGVmdCBvbiBkZXZpY2UAT3V0IG9mIG1lbW9yeQBSZXNvdXJjZSBidXN5AEludGVycnVwdGVkIHN5c3RlbSBjYWxsAFJlc291cmNlIHRlbXBvcmFyaWx5IHVuYXZhaWxhYmxlAEludmFsaWQgc2VlawBDcm9zcy1kZXZpY2UgbGluawBSZWFkLW9ubHkgZmlsZSBzeXN0ZW0ARGlyZWN0b3J5IG5vdCBlbXB0eQBDb25uZWN0aW9uIHJlc2V0IGJ5IHBlZXIAT3BlcmF0aW9uIHRpbWVkIG91dABDb25uZWN0aW9uIHJlZnVzZWQASG9zdCBpcyBkb3duAEhvc3QgaXMgdW5yZWFjaGFibGUAQWRkcmVzcyBpbiB1c2UAQnJva2VuIHBpcGUASS9PIGVycm9yAE5vIHN1Y2ggZGV2aWNlIG9yIGFkZHJlc3MAQmxvY2sgZGV2aWNlIHJlcXVpcmVkAE5vIHN1Y2ggZGV2aWNlAE5vdCBhIGRpcmVjdG9yeQBJcyBhIGRpcmVjdG9yeQBUZXh0IGZpbGUgYnVzeQBFeGVjIGZvcm1hdCBlcnJvcgBJbnZhbGlkIGFyZ3VtZW50AEFyZ3VtZW50IGxpc3QgdG9vIGxvbmcAU3ltYm9saWMgbGluayBsb29wAEZpbGVuYW1lIHRvbyBsb25nAFRvbyBtYW55IG9wZW4gZmlsZXMgaW4gc3lzdGVtAE5vIGZpbGUgZGVzY3JpcHRvcnMgYXZhaWxhYmxlAEJhZCBmaWxlIGRlc2NyaXB0b3IATm8gY2hpbGQgcHJvY2VzcwBCYWQgYWRkcmVzcwBGaWxlIHRvbyBsYXJnZQBUb28gbWFueSBsaW5rcwBObyBsb2NrcyBhdmFpbGFibGUAUmVzb3VyY2UgZGVhZGxvY2sgd291bGQgb2NjdXIAU3RhdGUgbm90IHJlY292ZXJhYmxlAFByZXZpb3VzIG93bmVyIGRpZWQAT3BlcmF0aW9uIGNhbmNlbGVkAEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZABObyBtZXNzYWdlIG9mIGRlc2lyZWQgdHlwZQBJZGVudGlmaWVyIHJlbW92ZWQARGV2aWNlIG5vdCBhIHN0cmVhbQBObyBkYXRhIGF2YWlsYWJsZQBEZXZpY2UgdGltZW91dABPdXQgb2Ygc3RyZWFtcyByZXNvdXJjZXMATGluayBoYXMgYmVlbiBzZXZlcmVkAFByb3RvY29sIGVycm9yAEJhZCBtZXNzYWdlAEZpbGUgZGVzY3JpcHRvciBpbiBiYWQgc3RhdGUATm90IGEgc29ja2V0AERlc3RpbmF0aW9uIGFkZHJlc3MgcmVxdWlyZWQATWVzc2FnZSB0b28gbGFyZ2UAUHJvdG9jb2wgd3JvbmcgdHlwZSBmb3Igc29ja2V0AFByb3RvY29sIG5vdCBhdmFpbGFibGUAUHJvdG9jb2wgbm90IHN1cHBvcnRlZABTb2NrZXQgdHlwZSBub3Qgc3VwcG9ydGVkAE5vdCBzdXBwb3J0ZWQAUHJvdG9jb2wgZmFtaWx5IG5vdCBzdXBwb3J0ZWQAQWRkcmVzcyBmYW1pbHkgbm90IHN1cHBvcnRlZCBieSBwcm90b2NvbABBZGRyZXNzIG5vdCBhdmFpbGFibGUATmV0d29yayBpcyBkb3duAE5ldHdvcmsgdW5yZWFjaGFibGUAQ29ubmVjdGlvbiByZXNldCBieSBuZXR3b3JrAENvbm5lY3Rpb24gYWJvcnRlZABObyBidWZmZXIgc3BhY2UgYXZhaWxhYmxlAFNvY2tldCBpcyBjb25uZWN0ZWQAU29ja2V0IG5vdCBjb25uZWN0ZWQAQ2Fubm90IHNlbmQgYWZ0ZXIgc29ja2V0IHNodXRkb3duAE9wZXJhdGlvbiBhbHJlYWR5IGluIHByb2dyZXNzAE9wZXJhdGlvbiBpbiBwcm9ncmVzcwBTdGFsZSBmaWxlIGhhbmRsZQBSZW1vdGUgSS9PIGVycm9yAFF1b3RhIGV4Y2VlZGVkAE5vIG1lZGl1bSBmb3VuZABXcm9uZyBtZWRpdW0gdHlwZQBNdWx0aWhvcCBhdHRlbXB0ZWQAUmVxdWlyZWQga2V5IG5vdCBhdmFpbGFibGUAS2V5IGhhcyBleHBpcmVkAEtleSBoYXMgYmVlbiByZXZva2VkAEtleSB3YXMgcmVqZWN0ZWQgYnkgc2VydmljZQAAAAAAAAAA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';
    return f;
}

var wasmBinaryFile;

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  var binary = tryParseAsDataURI(file);
  if (binary) {
    return binary;
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw 'both async and sync fetching of the wasm failed';
}

function getBinaryPromise(binaryFile) {

  // Otherwise, getBinarySync should be able to get it synchronously
  return Promise.resolve().then(() => getBinarySync(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
  return getBinaryPromise(binaryFile).then((binary) => {
    return WebAssembly.instantiate(binary, imports);
  }).then(receiver, (reason) => {
    err(`failed to asynchronously prepare wasm: ${reason}`);

    // Warn on some common problems.
    if (isFileURI(wasmBinaryFile)) {
      err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
    }
    abort(reason);
  });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
  return instantiateArrayBuffer(binaryFile, imports, callback);
}

function getWasmImports() {
  // prepare imports
  return {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports,
  }
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    wasmExports = instance.exports;

    

    wasmMemory = wasmExports['memory'];
    
    assert(wasmMemory, 'memory not found in wasm exports');
    updateMemoryViews();

    wasmTable = wasmExports['__indirect_function_table'];
    
    assert(wasmTable, 'table not found in wasm exports');

    addOnInit(wasmExports['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');
    return wasmExports;
  }
  // wait for the pthread pool (if any)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
    trueModule = null;
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above PTHREADS-enabled path.
    receiveInstance(result['instance']);
  }

  var info = getWasmImports();

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module['instantiateWasm']) {
    try {
      return Module['instantiateWasm'](info, receiveInstance);
    } catch(e) {
      err(`Module.instantiateWasm callback failed with error: ${e}`);
        // If instantiation fails, reject the module ready promise.
        readyPromiseReject(e);
    }
  }

  wasmBinaryFile ??= findWasmBinary();

  // If instantiation fails, reject the module ready promise.
  instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// include: runtime_debug.js
// Endianness check
(() => {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
})();

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)');
}

function legacyModuleProp(prop, newName, incoming=true) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      get() {
        let extra = incoming ? ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)' : '';
        abort(`\`Module.${prop}\` has been replaced by \`${newName}\`` + extra);

      }
    });
  }
}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === 'FS_createPath' ||
         name === 'FS_createDataFile' ||
         name === 'FS_createPreloadedFile' ||
         name === 'FS_unlink' ||
         name === 'addRunDependency' ||
         // The old FS has some functionality that WasmFS lacks.
         name === 'FS_createLazyFile' ||
         name === 'FS_createDevice' ||
         name === 'removeRunDependency';
}

/**
 * Intercept access to a global symbol.  This enables us to give informative
 * warnings/errors when folks attempt to use symbols they did not include in
 * their build, or no symbols that no longer exist.
 */
function hookGlobalSymbolAccess(sym, func) {
  // In MODULARIZE mode the generated code runs inside a function scope and not
  // the global scope, and JavaScript does not provide access to function scopes
  // so we cannot dynamically modify the scrope using `defineProperty` in this
  // case.
  //
  // In this mode we simply ignore requests for `hookGlobalSymbolAccess`. Since
  // this is a debug-only feature, skipping it is not major issue.
}

function missingGlobal(sym, msg) {
  hookGlobalSymbolAccess(sym, () => {
    warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
  });
}

missingGlobal('buffer', 'Please use HEAP8.buffer or wasmMemory.buffer');
missingGlobal('asm', 'Please use wasmExports instead');

function missingLibrarySymbol(sym) {
  hookGlobalSymbolAccess(sym, () => {
    // Can't `abort()` here because it would break code that does runtime
    // checks.  e.g. `if (typeof SDL === 'undefined')`.
    var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
    // DEFAULT_LIBRARY_FUNCS_TO_INCLUDE requires the name as it appears in
    // library.js, which means $name for a JS name with no prefix, or name
    // for a JS name like _name.
    var librarySymbol = sym;
    if (!librarySymbol.startsWith('_')) {
      librarySymbol = '$' + sym;
    }
    msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
    if (isExportedByForceFilesystem(sym)) {
      msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
    }
    warnOnce(msg);
  });

  // Any symbol that is not included from the JS library is also (by definition)
  // not exported on the Module object.
  unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get() {
        var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        abort(msg);
      }
    });
  }
}

// Used by XXXXX_DEBUG settings to output debug messages.
function dbg(...args) {
  // TODO(sbc): Make this configurable somehow.  Its not always convenient for
  // logging to show up as warnings.
  console.warn(...args);
}
// end include: runtime_debug.js
// === Body ===
// end include: preamble.js


  class ExitStatus {
      name = 'ExitStatus';
      constructor(status) {
        this.message = `Program terminated with exit(${status})`;
        this.status = status;
      }
    }

  var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    };

  
    /**
     * @param {number} ptr
     * @param {string} type
     */
  function getValue(ptr, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': return HEAP8[ptr];
      case 'i8': return HEAP8[ptr];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': abort('to do getValue(i64) use WASM_BIGINT');
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      case '*': return HEAPU32[((ptr)>>2)];
      default: abort(`invalid type for getValue: ${type}`);
    }
  }

  var noExitRuntime = Module['noExitRuntime'] || true;

  var ptrToString = (ptr) => {
      assert(typeof ptr === 'number');
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      ptr >>>= 0;
      return '0x' + ptr.toString(16).padStart(8, '0');
    };

  
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
  function setValue(ptr, value, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': HEAP8[ptr] = value; break;
      case 'i8': HEAP8[ptr] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': abort('to do setValue(i64) use WASM_BIGINT');
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      case '*': HEAPU32[((ptr)>>2)] = value; break;
      default: abort(`invalid type for setValue: ${type}`);
    }
  }

  var stackRestore = (val) => __emscripten_stack_restore(val);

  var stackSave = () => _emscripten_stack_get_current();

  var warnOnce = (text) => {
      warnOnce.shown ||= {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    };

  var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder() : undefined;
  
    /**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number=} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */
  var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.  Also, use the length info to avoid running tiny
      // strings through TextDecoder, since .subarray() allocates garbage.
      // (As a tiny code save trick, compare endPtr against endIdx using a negation,
      // so that undefined/NaN means Infinity)
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = '';
      // If building with TextDecoder, we have already computed the string length
      // above, so test loop end condition against that
      while (idx < endPtr) {
        // For UTF8 byte structure, see:
        // http://en.wikipedia.org/wiki/UTF-8#Description
        // https://www.ietf.org/rfc/rfc2279.txt
        // https://tools.ietf.org/html/rfc3629
        var u0 = heapOrArray[idx++];
        if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 0xF0) == 0xE0) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte ' + ptrToString(u0) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
        }
  
        if (u0 < 0x10000) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        }
      }
      return str;
    };
  
    /**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */
  var UTF8ToString = (ptr, maxBytesToRead) => {
      assert(typeof ptr == 'number', `UTF8ToString expects a number (got ${typeof ptr})`);
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    };
  var ___assert_fail = (condition, filename, line, func) =>
      abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);

  class ExceptionInfo {
      // excPtr - Thrown object pointer to wrap. Metadata pointer is calculated from it.
      constructor(excPtr) {
        this.excPtr = excPtr;
        this.ptr = excPtr - 24;
      }
  
      set_type(type) {
        HEAPU32[(((this.ptr)+(4))>>2)] = type;
      }
  
      get_type() {
        return HEAPU32[(((this.ptr)+(4))>>2)];
      }
  
      set_destructor(destructor) {
        HEAPU32[(((this.ptr)+(8))>>2)] = destructor;
      }
  
      get_destructor() {
        return HEAPU32[(((this.ptr)+(8))>>2)];
      }
  
      set_caught(caught) {
        caught = caught ? 1 : 0;
        HEAP8[(this.ptr)+(12)] = caught;
      }
  
      get_caught() {
        return HEAP8[(this.ptr)+(12)] != 0;
      }
  
      set_rethrown(rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[(this.ptr)+(13)] = rethrown;
      }
  
      get_rethrown() {
        return HEAP8[(this.ptr)+(13)] != 0;
      }
  
      // Initialize native structure fields. Should be called once after allocated.
      init(type, destructor) {
        this.set_adjusted_ptr(0);
        this.set_type(type);
        this.set_destructor(destructor);
      }
  
      set_adjusted_ptr(adjustedPtr) {
        HEAPU32[(((this.ptr)+(16))>>2)] = adjustedPtr;
      }
  
      get_adjusted_ptr() {
        return HEAPU32[(((this.ptr)+(16))>>2)];
      }
    }
  
  var exceptionLast = 0;
  
  var uncaughtExceptionCount = 0;
  var ___cxa_throw = (ptr, type, destructor) => {
      var info = new ExceptionInfo(ptr);
      // Initialize ExceptionInfo content after it was allocated in __cxa_allocate_exception.
      info.init(type, destructor);
      exceptionLast = ptr;
      uncaughtExceptionCount++;
      assert(false, 'Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.');
    };

  /** @suppress {duplicate } */
  var syscallGetVarargI = () => {
      assert(SYSCALLS.varargs != undefined);
      // the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
      var ret = HEAP32[((+SYSCALLS.varargs)>>2)];
      SYSCALLS.varargs += 4;
      return ret;
    };
  var syscallGetVarargP = syscallGetVarargI;
  
  
  var PATH = {
  isAbs:(path) => path.charAt(0) === '/',
  splitPath:(filename) => {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },
  normalizeArray:(parts, allowAboveRoot) => {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift('..');
          }
        }
        return parts;
      },
  normalize:(path) => {
        var isAbsolute = PATH.isAbs(path),
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter((p) => !!p), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },
  dirname:(path) => {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },
  basename:(path) => {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },
  join:(...paths) => PATH.normalize(paths.join('/')),
  join2:(l, r) => PATH.normalize(l + '/' + r),
  };
  
  var initRandomFill = () => {
      if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
        // for modern web browsers
        return (view) => crypto.getRandomValues(view);
      } else
      // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
      abort('no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: (array) => { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };');
    };
  var randomFill = (view) => {
      // Lazily init on the first invocation.
      return (randomFill = initRandomFill())(view);
    };
  
  
  
  var PATH_FS = {
  resolve:(...args) => {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? args[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path != 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = PATH.isAbs(path);
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter((p) => !!p), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },
  relative:(from, to) => {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      },
  };
  
  
  
  var FS_stdin_getChar_buffer = [];
  
  var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var c = str.charCodeAt(i); // possibly a lead surrogate
        if (c <= 0x7F) {
          len++;
        } else if (c <= 0x7FF) {
          len += 2;
        } else if (c >= 0xD800 && c <= 0xDFFF) {
          len += 4; ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };
  
  var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      assert(typeof str === 'string', `stringToUTF8Array expects a string (got ${typeof str})`);
      // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
      // undefined and false each don't write out any bytes.
      if (!(maxBytesToWrite > 0))
        return 0;
  
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
        // and https://www.ietf.org/rfc/rfc2279.txt
        // and https://tools.ietf.org/html/rfc3629
        var u = str.charCodeAt(i); // possibly a lead surrogate
        if (u >= 0xD800 && u <= 0xDFFF) {
          var u1 = str.charCodeAt(++i);
          u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
        }
        if (u <= 0x7F) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 0x7FF) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 0xC0 | (u >> 6);
          heap[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0xFFFF) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 0xE0 | (u >> 12);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          if (u > 0x10FFFF) warnOnce('Invalid Unicode code point ' + ptrToString(u) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
          heap[outIdx++] = 0xF0 | (u >> 18);
          heap[outIdx++] = 0x80 | ((u >> 12) & 63);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        }
      }
      // Null-terminate the pointer to the buffer.
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
  /** @type {function(string, boolean=, number=)} */
  function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array;
  }
  var FS_stdin_getChar = () => {
      if (!FS_stdin_getChar_buffer.length) {
        var result = null;
        if (typeof window != 'undefined' &&
          typeof window.prompt == 'function') {
          // Browser.
          result = window.prompt('Input: ');  // returns null on cancel
          if (result !== null) {
            result += '\n';
          }
        } else
        {}
        if (!result) {
          return null;
        }
        FS_stdin_getChar_buffer = intArrayFromString(result, true);
      }
      return FS_stdin_getChar_buffer.shift();
    };
  var TTY = {
  ttys:[],
  init() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process.stdin.setEncoding('utf8');
        // }
      },
  shutdown() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process.stdin.pause();
        // }
      },
  register(dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },
  stream_ops:{
  open(stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(43);
          }
          stream.tty = tty;
          stream.seekable = false;
        },
  close(stream) {
          // flush any pending line data
          stream.tty.ops.fsync(stream.tty);
        },
  fsync(stream) {
          stream.tty.ops.fsync(stream.tty);
        },
  read(stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(60);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },
  write(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(60);
          }
          try {
            for (var i = 0; i < length; i++) {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            }
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        },
  },
  default_tty_ops:{
  get_char(tty) {
          return FS_stdin_getChar();
        },
  put_char(tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
          }
        },
  fsync(tty) {
          if (tty.output && tty.output.length > 0) {
            out(UTF8ArrayToString(tty.output));
            tty.output = [];
          }
        },
  ioctl_tcgets(tty) {
          // typical setting
          return {
            c_iflag: 25856,
            c_oflag: 5,
            c_cflag: 191,
            c_lflag: 35387,
            c_cc: [
              0x03, 0x1c, 0x7f, 0x15, 0x04, 0x00, 0x01, 0x00, 0x11, 0x13, 0x1a, 0x00,
              0x12, 0x0f, 0x17, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
              0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            ]
          };
        },
  ioctl_tcsets(tty, optional_actions, data) {
          // currently just ignore
          return 0;
        },
  ioctl_tiocgwinsz(tty) {
          return [24, 80];
        },
  },
  default_tty1_ops:{
  put_char(tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },
  fsync(tty) {
          if (tty.output && tty.output.length > 0) {
            err(UTF8ArrayToString(tty.output));
            tty.output = [];
          }
        },
  },
  };
  
  
  var zeroMemory = (address, size) => {
      HEAPU8.fill(0, address, address + size);
    };
  
  var alignMemory = (size, alignment) => {
      assert(alignment, "alignment argument is required");
      return Math.ceil(size / alignment) * alignment;
    };
  var mmapAlloc = (size) => {
      abort('internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported');
    };
  var MEMFS = {
  ops_table:null,
  mount(mount) {
        return MEMFS.createNode(null, '/', 16895, 0);
      },
  createNode(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(63);
        }
        MEMFS.ops_table ||= {
          dir: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              lookup: MEMFS.node_ops.lookup,
              mknod: MEMFS.node_ops.mknod,
              rename: MEMFS.node_ops.rename,
              unlink: MEMFS.node_ops.unlink,
              rmdir: MEMFS.node_ops.rmdir,
              readdir: MEMFS.node_ops.readdir,
              symlink: MEMFS.node_ops.symlink
            },
            stream: {
              llseek: MEMFS.stream_ops.llseek
            }
          },
          file: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr
            },
            stream: {
              llseek: MEMFS.stream_ops.llseek,
              read: MEMFS.stream_ops.read,
              write: MEMFS.stream_ops.write,
              allocate: MEMFS.stream_ops.allocate,
              mmap: MEMFS.stream_ops.mmap,
              msync: MEMFS.stream_ops.msync
            }
          },
          link: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              readlink: MEMFS.node_ops.readlink
            },
            stream: {}
          },
          chrdev: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr
            },
            stream: FS.chrdev_stream_ops
          }
        };
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
          parent.timestamp = node.timestamp;
        }
        return node;
      },
  getFileDataAsTypedArray(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },
  expandFileStorage(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
        // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
        // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
        // avoid overshooting the allocation cap by a very large margin.
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>> 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity); // Allocate new storage.
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
      },
  resizeFileStorage(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
        }
      },
  node_ops:{
  getattr(node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },
  setattr(node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },
  lookup(parent, name) {
          throw new FS.ErrnoError(44);
        },
  mknod(parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },
  rename(old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(55);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.parent.timestamp = Date.now()
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          new_dir.timestamp = old_node.parent.timestamp;
        },
  unlink(parent, name) {
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },
  rmdir(parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(55);
          }
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },
  readdir(node) {
          var entries = ['.', '..'];
          for (var key of Object.keys(node.contents)) {
            entries.push(key);
          }
          return entries;
        },
  symlink(parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 0o777 | 40960, 0);
          node.link = oldpath;
          return node;
        },
  readlink(node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          return node.link;
        },
  },
  stream_ops:{
  read(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },
  write(stream, buffer, offset, length, position, canOwn) {
          // The data buffer should be a typed array view
          assert(!(buffer instanceof ArrayBuffer));
  
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) {
              assert(position === 0, 'canOwn must imply no weird position inside the file');
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = buffer.slice(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) {
            // Use typed array write which is available.
            node.contents.set(buffer.subarray(offset, offset + length), position);
          } else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },
  llseek(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(28);
          }
          return position;
        },
  allocate(stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },
  mmap(stream, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if (!(flags & 2) && contents && contents.buffer === HEAP8.buffer) {
            // We can't emulate MAP_SHARED when the file is not backed by the
            // buffer we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            allocated = true;
            ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            if (contents) {
              // Try to avoid unnecessary slices.
              if (position > 0 || position + length < contents.length) {
                if (contents.subarray) {
                  contents = contents.subarray(position, position + length);
                } else {
                  contents = Array.prototype.slice.call(contents, position, position + length);
                }
              }
              HEAP8.set(contents, ptr);
            }
          }
          return { ptr, allocated };
        },
  msync(stream, buffer, offset, length, mmapFlags) {
          MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        },
  },
  };
  
  /** @param {boolean=} noRunDep */
  var asyncLoad = (url, onload, onerror, noRunDep) => {
      var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : '';
      readAsync(url).then(
        (arrayBuffer) => {
          assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`);
          onload(new Uint8Array(arrayBuffer));
          if (dep) removeRunDependency(dep);
        },
        (err) => {
          if (onerror) {
            onerror();
          } else {
            throw `Loading data file "${url}" failed.`;
          }
        }
      );
      if (dep) addRunDependency(dep);
    };
  
  
  var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
      FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
    };
  
  var preloadPlugins = Module['preloadPlugins'] || [];
  var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
      // Ensure plugins are ready.
      if (typeof Browser != 'undefined') Browser.init();
  
      var handled = false;
      preloadPlugins.forEach((plugin) => {
        if (handled) return;
        if (plugin['canHandle'](fullname)) {
          plugin['handle'](byteArray, fullname, finish, onerror);
          handled = true;
        }
      });
      return handled;
    };
  var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
      // TODO we should allow people to just pass in a complete filename instead
      // of parent and name being that we just join them anyways
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      var dep = getUniqueRunDependency(`cp ${fullname}`); // might have several active requests for the same fullname
      function processData(byteArray) {
        function finish(byteArray) {
          preFinish?.();
          if (!dontCreateFile) {
            FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
          }
          onload?.();
          removeRunDependency(dep);
        }
        if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
          onerror?.();
          removeRunDependency(dep);
        })) {
          return;
        }
        finish(byteArray);
      }
      addRunDependency(dep);
      if (typeof url == 'string') {
        asyncLoad(url, processData, onerror);
      } else {
        processData(url);
      }
    };
  
  var FS_modeStringToFlags = (str) => {
      var flagModes = {
        'r': 0,
        'r+': 2,
        'w': 512 | 64 | 1,
        'w+': 512 | 64 | 2,
        'a': 1024 | 64 | 1,
        'a+': 1024 | 64 | 2,
      };
      var flags = flagModes[str];
      if (typeof flags == 'undefined') {
        throw new Error(`Unknown file open mode: ${str}`);
      }
      return flags;
    };
  
  var FS_getMode = (canRead, canWrite) => {
      var mode = 0;
      if (canRead) mode |= 292 | 73;
      if (canWrite) mode |= 146;
      return mode;
    };
  
  
  
  
  
  
  var strError = (errno) => UTF8ToString(_strerror(errno));
  
  var ERRNO_CODES = {
      'EPERM': 63,
      'ENOENT': 44,
      'ESRCH': 71,
      'EINTR': 27,
      'EIO': 29,
      'ENXIO': 60,
      'E2BIG': 1,
      'ENOEXEC': 45,
      'EBADF': 8,
      'ECHILD': 12,
      'EAGAIN': 6,
      'EWOULDBLOCK': 6,
      'ENOMEM': 48,
      'EACCES': 2,
      'EFAULT': 21,
      'ENOTBLK': 105,
      'EBUSY': 10,
      'EEXIST': 20,
      'EXDEV': 75,
      'ENODEV': 43,
      'ENOTDIR': 54,
      'EISDIR': 31,
      'EINVAL': 28,
      'ENFILE': 41,
      'EMFILE': 33,
      'ENOTTY': 59,
      'ETXTBSY': 74,
      'EFBIG': 22,
      'ENOSPC': 51,
      'ESPIPE': 70,
      'EROFS': 69,
      'EMLINK': 34,
      'EPIPE': 64,
      'EDOM': 18,
      'ERANGE': 68,
      'ENOMSG': 49,
      'EIDRM': 24,
      'ECHRNG': 106,
      'EL2NSYNC': 156,
      'EL3HLT': 107,
      'EL3RST': 108,
      'ELNRNG': 109,
      'EUNATCH': 110,
      'ENOCSI': 111,
      'EL2HLT': 112,
      'EDEADLK': 16,
      'ENOLCK': 46,
      'EBADE': 113,
      'EBADR': 114,
      'EXFULL': 115,
      'ENOANO': 104,
      'EBADRQC': 103,
      'EBADSLT': 102,
      'EDEADLOCK': 16,
      'EBFONT': 101,
      'ENOSTR': 100,
      'ENODATA': 116,
      'ETIME': 117,
      'ENOSR': 118,
      'ENONET': 119,
      'ENOPKG': 120,
      'EREMOTE': 121,
      'ENOLINK': 47,
      'EADV': 122,
      'ESRMNT': 123,
      'ECOMM': 124,
      'EPROTO': 65,
      'EMULTIHOP': 36,
      'EDOTDOT': 125,
      'EBADMSG': 9,
      'ENOTUNIQ': 126,
      'EBADFD': 127,
      'EREMCHG': 128,
      'ELIBACC': 129,
      'ELIBBAD': 130,
      'ELIBSCN': 131,
      'ELIBMAX': 132,
      'ELIBEXEC': 133,
      'ENOSYS': 52,
      'ENOTEMPTY': 55,
      'ENAMETOOLONG': 37,
      'ELOOP': 32,
      'EOPNOTSUPP': 138,
      'EPFNOSUPPORT': 139,
      'ECONNRESET': 15,
      'ENOBUFS': 42,
      'EAFNOSUPPORT': 5,
      'EPROTOTYPE': 67,
      'ENOTSOCK': 57,
      'ENOPROTOOPT': 50,
      'ESHUTDOWN': 140,
      'ECONNREFUSED': 14,
      'EADDRINUSE': 3,
      'ECONNABORTED': 13,
      'ENETUNREACH': 40,
      'ENETDOWN': 38,
      'ETIMEDOUT': 73,
      'EHOSTDOWN': 142,
      'EHOSTUNREACH': 23,
      'EINPROGRESS': 26,
      'EALREADY': 7,
      'EDESTADDRREQ': 17,
      'EMSGSIZE': 35,
      'EPROTONOSUPPORT': 66,
      'ESOCKTNOSUPPORT': 137,
      'EADDRNOTAVAIL': 4,
      'ENETRESET': 39,
      'EISCONN': 30,
      'ENOTCONN': 53,
      'ETOOMANYREFS': 141,
      'EUSERS': 136,
      'EDQUOT': 19,
      'ESTALE': 72,
      'ENOTSUP': 138,
      'ENOMEDIUM': 148,
      'EILSEQ': 25,
      'EOVERFLOW': 61,
      'ECANCELED': 11,
      'ENOTRECOVERABLE': 56,
      'EOWNERDEAD': 62,
      'ESTRPIPE': 135,
    };
  var FS = {
  root:null,
  mounts:[],
  devices:{
  },
  streams:[],
  nextInode:1,
  nameTable:null,
  currentPath:"/",
  initialized:false,
  ignorePermissions:true,
  ErrnoError:class extends Error {
        name = 'ErrnoError';
        // We set the `name` property to be able to identify `FS.ErrnoError`
        // - the `name` is a standard ECMA-262 property of error objects. Kind of good to have it anyway.
        // - when using PROXYFS, an error can come from an underlying FS
        // as different FS objects have their own FS.ErrnoError each,
        // the test `err instanceof FS.ErrnoError` won't detect an error coming from another filesystem, causing bugs.
        // we'll use the reliable test `err.name == "ErrnoError"` instead
        constructor(errno) {
          super(runtimeInitialized ? strError(errno) : '');
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
        }
      },
  filesystems:null,
  syncFSRequests:0,
  readFiles:{
  },
  FSStream:class {
        shared = {};
        get object() {
          return this.node;
        }
        set object(val) {
          this.node = val;
        }
        get isRead() {
          return (this.flags & 2097155) !== 1;
        }
        get isWrite() {
          return (this.flags & 2097155) !== 0;
        }
        get isAppend() {
          return (this.flags & 1024);
        }
        get flags() {
          return this.shared.flags;
        }
        set flags(val) {
          this.shared.flags = val;
        }
        get position() {
          return this.shared.position;
        }
        set position(val) {
          this.shared.position = val;
        }
      },
  FSNode:class {
        node_ops = {};
        stream_ops = {};
        readMode = 292 | 73;
        writeMode = 146;
        mounted = null;
        constructor(parent, name, mode, rdev) {
          if (!parent) {
            parent = this;  // root node sets parent to itself
          }
          this.parent = parent;
          this.mount = parent.mount;
          this.id = FS.nextInode++;
          this.name = name;
          this.mode = mode;
          this.rdev = rdev;
        }
        get read() {
          return (this.mode & this.readMode) === this.readMode;
        }
        set read(val) {
          val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
        }
        get write() {
          return (this.mode & this.writeMode) === this.writeMode;
        }
        set write(val) {
          val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
        }
        get isFolder() {
          return FS.isDir(this.mode);
        }
        get isDevice() {
          return FS.isChrdev(this.mode);
        }
      },
  lookupPath(path, opts = {}) {
        path = PATH_FS.resolve(path);
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        opts = Object.assign(defaults, opts)
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(32);
        }
  
        // split the absolute path
        var parts = path.split('/').filter((p) => !!p);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
  
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(32);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },
  getPath(node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? `${mount}/${path}` : mount + path;
          }
          path = path ? `${node.name}/${path}` : node.name;
          node = node.parent;
        }
      },
  hashName(parentid, name) {
        var hash = 0;
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },
  hashAddNode(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },
  hashRemoveNode(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },
  lookupNode(parent, name) {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },
  createNode(parent, name, mode, rdev) {
        assert(typeof parent == 'object')
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },
  destroyNode(node) {
        FS.hashRemoveNode(node);
      },
  isRoot(node) {
        return node === node.parent;
      },
  isMountpoint(node) {
        return !!node.mounted;
      },
  isFile(mode) {
        return (mode & 61440) === 32768;
      },
  isDir(mode) {
        return (mode & 61440) === 16384;
      },
  isLink(mode) {
        return (mode & 61440) === 40960;
      },
  isChrdev(mode) {
        return (mode & 61440) === 8192;
      },
  isBlkdev(mode) {
        return (mode & 61440) === 24576;
      },
  isFIFO(mode) {
        return (mode & 61440) === 4096;
      },
  isSocket(mode) {
        return (mode & 49152) === 49152;
      },
  flagsToPermissionString(flag) {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },
  nodePermissions(node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.includes('r') && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes('w') && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes('x') && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      },
  mayLookup(dir) {
        if (!FS.isDir(dir.mode)) return 54;
        var errCode = FS.nodePermissions(dir, 'x');
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
      },
  mayCreate(dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },
  mayDelete(dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, 'wx');
        if (errCode) {
          return errCode;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 54;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 10;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 31;
          }
        }
        return 0;
      },
  mayOpen(node, flags) {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
              (flags & 512)) { // TODO: check for O_SEARCH? (== search for dir only)
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },
  MAX_OPEN_FDS:4096,
  nextfd() {
        for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      },
  getStreamChecked(fd) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        return stream;
      },
  getStream:(fd) => FS.streams[fd],
  createStream(stream, fd = -1) {
        assert(fd >= -1);
  
        // clone it, so we can return an instance of FSStream
        stream = Object.assign(new FS.FSStream(), stream);
        if (fd == -1) {
          fd = FS.nextfd();
        }
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },
  closeStream(fd) {
        FS.streams[fd] = null;
      },
  dupStream(origStream, fd = -1) {
        var stream = FS.createStream(origStream, fd);
        stream.stream_ops?.dup?.(stream);
        return stream;
      },
  chrdev_stream_ops:{
  open(stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          stream.stream_ops.open?.(stream);
        },
  llseek() {
          throw new FS.ErrnoError(70);
        },
  },
  major:(dev) => ((dev) >> 8),
  minor:(dev) => ((dev) & 0xff),
  makedev:(ma, mi) => ((ma) << 8 | (mi)),
  registerDevice(dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },
  getDevice:(dev) => FS.devices[dev],
  getMounts(mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push(...m.mounts);
        }
  
        return mounts;
      },
  syncfs(populate, callback) {
        if (typeof populate == 'function') {
          callback = populate;
          populate = false;
        }
  
        FS.syncFSRequests++;
  
        if (FS.syncFSRequests > 1) {
          err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function doCallback(errCode) {
          assert(FS.syncFSRequests > 0);
          FS.syncFSRequests--;
          return callback(errCode);
        }
  
        function done(errCode) {
          if (errCode) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(errCode);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach((mount) => {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },
  mount(type, opts, mountpoint) {
        if (typeof type == 'string') {
          // The filesystem was not included, and instead we have an error
          // message stored in the variable.
          throw type;
        }
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
  
        var mount = {
          type,
          opts,
          mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },
  unmount(mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(28);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach((hash) => {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },
  lookup(parent, name) {
        return parent.node_ops.lookup(parent, name);
      },
  mknod(path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },
  statfs(path) {
  
        // NOTE: None of the defaults here are true. We're just returning safe and
        //       sane values.
        var rtn = {
          bsize: 4096,
          frsize: 4096,
          blocks: 1e6,
          bfree: 5e5,
          bavail: 5e5,
          files: FS.nextInode,
          ffree: FS.nextInode - 1,
          fsid: 42,
          flags: 2,
          namelen: 255,
        };
  
        var parent = FS.lookupPath(path, {follow: true}).node;
        if (parent?.node_ops.statfs) {
          Object.assign(rtn, parent.node_ops.statfs(parent.mount.opts.root));
        }
        return rtn;
      },
  create(path, mode = 0o666) {
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },
  mkdir(path, mode = 0o777) {
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },
  mkdirTree(path, mode) {
        var dirs = path.split('/');
        var d = '';
        for (var i = 0; i < dirs.length; ++i) {
          if (!dirs[i]) continue;
          d += '/' + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch(e) {
            if (e.errno != 20) throw e;
          }
        }
      },
  mkdev(path, mode, dev) {
        if (typeof dev == 'undefined') {
          dev = mode;
          mode = 0o666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },
  symlink(oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },
  rename(old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
  
        // let the errors from non existent directories percolate up
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
  
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(28);
        }
        // new path should not be an ancestor of the old path
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(55);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        errCode = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(10);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
          // update old node (we do this here to avoid each backend
          // needing to)
          old_node.parent = new_dir;
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },
  rmdir(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },
  readdir(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
      },
  unlink(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          // According to POSIX, we should map EISDIR to EPERM, but
          // we instead do what Linux does (and we must, as we use
          // the musl linux libc).
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },
  readlink(path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return link.node_ops.readlink(link);
      },
  stat(path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
      },
  lstat(path) {
        return FS.stat(path, true);
      },
  chmod(path, mode, dontFollow) {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },
  lchmod(path, mode) {
        FS.chmod(path, mode, true);
      },
  fchmod(fd, mode) {
        var stream = FS.getStreamChecked(fd);
        FS.chmod(stream.node, mode);
      },
  chown(path, uid, gid, dontFollow) {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },
  lchown(path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },
  fchown(fd, uid, gid) {
        var stream = FS.getStreamChecked(fd);
        FS.chown(stream.node, uid, gid);
      },
  truncate(path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, 'w');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },
  ftruncate(fd, len) {
        var stream = FS.getStreamChecked(fd);
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
      },
  utime(path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },
  open(path, flags, mode = 0o666) {
        if (path === "") {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags == 'string' ? FS_modeStringToFlags(flags) : flags;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path == 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(20);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // do truncation if necessary
        if ((flags & 512) && !created) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512 | 131072);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        });
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
          }
        }
        return stream;
      },
  close(stream) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null; // free readdir state
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },
  isClosed(stream) {
        return stream.fd === null;
      },
  llseek(stream, offset, whence) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
          throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },
  read(stream, buffer, offset, length, position) {
        assert(offset >= 0);
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(28);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },
  write(stream, buffer, offset, length, position, canOwn) {
        assert(offset >= 0);
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },
  allocate(stream, offset, length) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },
  mmap(stream, length, position, prot, flags) {
        // User requests writing to file (prot & PROT_WRITE != 0).
        // Checking if we have permissions to write to the file unless
        // MAP_PRIVATE flag is set. According to POSIX spec it is possible
        // to write to file opened in read-only mode with MAP_PRIVATE flag,
        // as all modifications will be visible only in the memory of
        // the current process.
        if ((prot & 2) !== 0
            && (flags & 2) === 0
            && (stream.flags & 2097155) !== 2) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        if (!length) {
          throw new FS.ErrnoError(28);
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags);
      },
  msync(stream, buffer, offset, length, mmapFlags) {
        assert(offset >= 0);
        if (!stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },
  ioctl(stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },
  readFile(path, opts = {}) {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error(`Invalid encoding type "${opts.encoding}"`);
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },
  writeFile(path, data, opts = {}) {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == 'string') {
          var buf = new Uint8Array(lengthBytesUTF8(data)+1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error('Unsupported data type');
        }
        FS.close(stream);
      },
  cwd:() => FS.currentPath,
  chdir(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, 'x');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
      },
  createDefaultDirectories() {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },
  createDefaultDevices() {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: () => 0,
          write: (stream, buffer, offset, length, pos) => length,
          llseek: () => 0,
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using err() rather than out()
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        // use a buffer to avoid overhead of individual crypto calls per byte
        var randomBuffer = new Uint8Array(1024), randomLeft = 0;
        var randomByte = () => {
          if (randomLeft === 0) {
            randomLeft = randomFill(randomBuffer).byteLength;
          }
          return randomBuffer[--randomLeft];
        };
        FS.createDevice('/dev', 'random', randomByte);
        FS.createDevice('/dev', 'urandom', randomByte);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },
  createSpecialDirectories() {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
        // name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        var proc_self = FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount() {
            var node = FS.createNode(proc_self, 'fd', 16895, 73);
            node.node_ops = {
              lookup(parent, name) {
                var fd = +name;
                var stream = FS.getStreamChecked(fd);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: () => stream.path },
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },
  createStandardStreams(input, output, error) {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (input) {
          FS.createDevice('/dev', 'stdin', input);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (output) {
          FS.createDevice('/dev', 'stdout', null, output);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (error) {
          FS.createDevice('/dev', 'stderr', null, error);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 0);
        var stdout = FS.open('/dev/stdout', 1);
        var stderr = FS.open('/dev/stderr', 1);
        assert(stdin.fd === 0, `invalid handle for stdin (${stdin.fd})`);
        assert(stdout.fd === 1, `invalid handle for stdout (${stdout.fd})`);
        assert(stderr.fd === 2, `invalid handle for stderr (${stderr.fd})`);
      },
  staticInit() {
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
        };
      },
  init(input, output, error) {
        assert(!FS.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.initialized = true;
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input ??= Module['stdin'];
        output ??= Module['stdout'];
        error ??= Module['stderr'];
  
        FS.createStandardStreams(input, output, error);
      },
  quit() {
        FS.initialized = false;
        // force-flush all streams, so we get musl std streams printed out
        _fflush(0);
        // close all of our streams
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },
  findObject(path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (!ret.exists) {
          return null;
        }
        return ret.object;
      },
  analyzePath(path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },
  createPath(parent, path, canRead, canWrite) {
        parent = typeof parent == 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },
  createFile(parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS_getMode(canRead, canWrite);
        return FS.create(path, mode);
      },
  createDataFile(parent, name, data, canRead, canWrite, canOwn) {
        var path = name;
        if (parent) {
          parent = typeof parent == 'string' ? parent : FS.getPath(parent);
          path = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS_getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data == 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
      },
  createDevice(parent, name, input, output) {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS_getMode(!!input, !!output);
        FS.createDevice.major ??= 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open(stream) {
            stream.seekable = false;
          },
          close(stream) {
            // flush any pending line data
            if (output?.buffer?.length) {
              output(10);
            }
          },
          read(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },
  forceLoadFile(obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest != 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else { // Command-line.
          try {
            obj.contents = readBinary(obj.url);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
      },
  createLazyFile(parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array).
        // Actual getting is abstracted away for eventual reuse.
        class LazyUint8Array {
          lengthKnown = false;
          chunks = []; // Loaded chunks. Index is the chunk number
          get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = (idx / this.chunkSize)|0;
            return this.getter(chunkNum)[chunkOffset];
          }
          setDataGetter(getter) {
            this.getter = getter;
          }
          cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
  
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (from, to) => {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(/** @type{Array<number>} */(xhr.response || []));
              }
              return intArrayFromString(xhr.responseText || '', true);
            };
            var lazyArray = this;
            lazyArray.setDataGetter((chunkNum) => {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
              return lazyArray.chunks[chunkNum];
            });
  
            if (usesGzip || !datalength) {
              // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
              chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
              datalength = this.getter(0).length;
              chunkSize = datalength;
              out("LazyFiles on gzip forces download of the whole file when length is accessed");
            }
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
          }
          get length() {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._length;
          }
          get chunkSize() {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._chunkSize;
          }
        }
  
        if (typeof XMLHttpRequest != 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperties(node, {
          usedBytes: {
            get: function() { return this.contents.length; }
          }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach((key) => {
          var fn = node.stream_ops[key];
          stream_ops[key] = (...args) => {
            FS.forceLoadFile(node);
            return fn(...args);
          };
        });
        function writeChunks(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        }
        // use a custom read function
        stream_ops.read = (stream, buffer, offset, length, position) => {
          FS.forceLoadFile(node);
          return writeChunks(stream, buffer, offset, length, position)
        };
        // use a custom mmap function
        stream_ops.mmap = (stream, length, position, prot, flags) => {
          FS.forceLoadFile(node);
          var ptr = mmapAlloc(length);
          if (!ptr) {
            throw new FS.ErrnoError(48);
          }
          writeChunks(stream, HEAP8, ptr, length, position);
          return { ptr, allocated: true };
        };
        node.stream_ops = stream_ops;
        return node;
      },
  absolutePath() {
        abort('FS.absolutePath has been removed; use PATH_FS.resolve instead');
      },
  createFolder() {
        abort('FS.createFolder has been removed; use FS.mkdir instead');
      },
  createLink() {
        abort('FS.createLink has been removed; use FS.symlink instead');
      },
  joinPath() {
        abort('FS.joinPath has been removed; use PATH.join instead');
      },
  mmapAlloc() {
        abort('FS.mmapAlloc has been replaced by the top level function mmapAlloc');
      },
  standardizePath() {
        abort('FS.standardizePath has been removed; use PATH.normalize instead');
      },
  };
  
  var SYSCALLS = {
  DEFAULT_POLLMASK:5,
  calculateAt(dirfd, path, allowEmpty) {
        if (PATH.isAbs(path)) {
          return path;
        }
        // relative path
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = SYSCALLS.getStreamFromFD(dirfd);
          dir = dirstream.path;
        }
        if (path.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);;
          }
          return dir;
        }
        return PATH.join2(dir, path);
      },
  doStat(func, path, buf) {
        var stat = func(path);
        HEAP32[((buf)>>2)] = stat.dev;
        HEAP32[(((buf)+(4))>>2)] = stat.mode;
        HEAPU32[(((buf)+(8))>>2)] = stat.nlink;
        HEAP32[(((buf)+(12))>>2)] = stat.uid;
        HEAP32[(((buf)+(16))>>2)] = stat.gid;
        HEAP32[(((buf)+(20))>>2)] = stat.rdev;
        (tempI64 = [stat.size>>>0,(tempDouble = stat.size,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(24))>>2)] = tempI64[0],HEAP32[(((buf)+(28))>>2)] = tempI64[1]);
        HEAP32[(((buf)+(32))>>2)] = 4096;
        HEAP32[(((buf)+(36))>>2)] = stat.blocks;
        var atime = stat.atime.getTime();
        var mtime = stat.mtime.getTime();
        var ctime = stat.ctime.getTime();
        (tempI64 = [Math.floor(atime / 1000)>>>0,(tempDouble = Math.floor(atime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(40))>>2)] = tempI64[0],HEAP32[(((buf)+(44))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(48))>>2)] = (atime % 1000) * 1000 * 1000;
        (tempI64 = [Math.floor(mtime / 1000)>>>0,(tempDouble = Math.floor(mtime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(56))>>2)] = tempI64[0],HEAP32[(((buf)+(60))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(64))>>2)] = (mtime % 1000) * 1000 * 1000;
        (tempI64 = [Math.floor(ctime / 1000)>>>0,(tempDouble = Math.floor(ctime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(72))>>2)] = tempI64[0],HEAP32[(((buf)+(76))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(80))>>2)] = (ctime % 1000) * 1000 * 1000;
        (tempI64 = [stat.ino>>>0,(tempDouble = stat.ino,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(88))>>2)] = tempI64[0],HEAP32[(((buf)+(92))>>2)] = tempI64[1]);
        return 0;
      },
  doMsync(addr, stream, len, flags, offset) {
        if (!FS.isFile(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (flags & 2) {
          // MAP_PRIVATE calls need not to be synced back to underlying fs
          return 0;
        }
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
      },
  getStreamFromFD(fd) {
        var stream = FS.getStreamChecked(fd);
        return stream;
      },
  varargs:undefined,
  getStr(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
  };
  function ___syscall_fcntl64(fd, cmd, varargs) {
  SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (cmd) {
        case 0: {
          var arg = syscallGetVarargI();
          if (arg < 0) {
            return -28;
          }
          while (FS.streams[arg]) {
            arg++;
          }
          var newStream;
          newStream = FS.dupStream(stream, arg);
          return newStream.fd;
        }
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          return stream.flags;
        case 4: {
          var arg = syscallGetVarargI();
          stream.flags |= arg;
          return 0;
        }
        case 12: {
          var arg = syscallGetVarargP();
          var offset = 0;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)] = 2;
          return 0;
        }
        case 13:
        case 14:
          return 0; // Pretend that the locking is successful.
      }
      return -28;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  }

  
  function ___syscall_ioctl(fd, op, varargs) {
  SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (op) {
        case 21509: {
          if (!stream.tty) return -59;
          return 0;
        }
        case 21505: {
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tcgets) {
            var termios = stream.tty.ops.ioctl_tcgets(stream);
            var argp = syscallGetVarargP();
            HEAP32[((argp)>>2)] = termios.c_iflag || 0;
            HEAP32[(((argp)+(4))>>2)] = termios.c_oflag || 0;
            HEAP32[(((argp)+(8))>>2)] = termios.c_cflag || 0;
            HEAP32[(((argp)+(12))>>2)] = termios.c_lflag || 0;
            for (var i = 0; i < 32; i++) {
              HEAP8[(argp + i)+(17)] = termios.c_cc[i] || 0;
            }
            return 0;
          }
          return 0;
        }
        case 21510:
        case 21511:
        case 21512: {
          if (!stream.tty) return -59;
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21506:
        case 21507:
        case 21508: {
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tcsets) {
            var argp = syscallGetVarargP();
            var c_iflag = HEAP32[((argp)>>2)];
            var c_oflag = HEAP32[(((argp)+(4))>>2)];
            var c_cflag = HEAP32[(((argp)+(8))>>2)];
            var c_lflag = HEAP32[(((argp)+(12))>>2)];
            var c_cc = []
            for (var i = 0; i < 32; i++) {
              c_cc.push(HEAP8[(argp + i)+(17)]);
            }
            return stream.tty.ops.ioctl_tcsets(stream.tty, op, { c_iflag, c_oflag, c_cflag, c_lflag, c_cc });
          }
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21519: {
          if (!stream.tty) return -59;
          var argp = syscallGetVarargP();
          HEAP32[((argp)>>2)] = 0;
          return 0;
        }
        case 21520: {
          if (!stream.tty) return -59;
          return -28; // not supported
        }
        case 21531: {
          var argp = syscallGetVarargP();
          return FS.ioctl(stream, op, argp);
        }
        case 21523: {
          // TODO: in theory we should write to the winsize struct that gets
          // passed in, but for now musl doesn't read anything on it
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tiocgwinsz) {
            var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
            var argp = syscallGetVarargP();
            HEAP16[((argp)>>1)] = winsize[0];
            HEAP16[(((argp)+(2))>>1)] = winsize[1];
          }
          return 0;
        }
        case 21524: {
          // TODO: technically, this ioctl call should change the window size.
          // but, since emscripten doesn't have any concept of a terminal window
          // yet, we'll just silently throw it away as we do TIOCGWINSZ
          if (!stream.tty) return -59;
          return 0;
        }
        case 21515: {
          if (!stream.tty) return -59;
          return 0;
        }
        default: return -28; // not supported
      }
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  }

  
  function ___syscall_openat(dirfd, path, flags, varargs) {
  SYSCALLS.varargs = varargs;
  try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      var mode = varargs ? syscallGetVarargI() : 0;
      return FS.open(path, flags, mode).fd;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  }

  var __abort_js = () =>
      abort('native code called abort()');

  var structRegistrations = {
  };
  
  var runDestructors = (destructors) => {
      while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
      }
    };
  
  /** @suppress {globalThis} */
  function readPointer(pointer) {
      return this['fromWireType'](HEAPU32[((pointer)>>2)]);
    }
  
  var awaitingDependencies = {
  };
  
  var registeredTypes = {
  };
  
  var typeDependencies = {
  };
  
  var InternalError;
  var throwInternalError = (message) => { throw new InternalError(message); };
  var whenDependentTypesAreResolved = (myTypes, dependentTypes, getTypeConverters) => {
      myTypes.forEach((type) => typeDependencies[type] = dependentTypes);
  
      function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
          throwInternalError('Mismatched type converter count');
        }
        for (var i = 0; i < myTypes.length; ++i) {
          registerType(myTypes[i], myTypeConverters[i]);
        }
      }
  
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach((dt, i) => {
        if (registeredTypes.hasOwnProperty(dt)) {
          typeConverters[i] = registeredTypes[dt];
        } else {
          unregisteredTypes.push(dt);
          if (!awaitingDependencies.hasOwnProperty(dt)) {
            awaitingDependencies[dt] = [];
          }
          awaitingDependencies[dt].push(() => {
            typeConverters[i] = registeredTypes[dt];
            ++registered;
            if (registered === unregisteredTypes.length) {
              onComplete(typeConverters);
            }
          });
        }
      });
      if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
      }
    };
  var __embind_finalize_value_object = (structType) => {
      var reg = structRegistrations[structType];
      delete structRegistrations[structType];
  
      var rawConstructor = reg.rawConstructor;
      var rawDestructor = reg.rawDestructor;
      var fieldRecords = reg.fields;
      var fieldTypes = fieldRecords.map((field) => field.getterReturnType).
                concat(fieldRecords.map((field) => field.setterArgumentType));
      whenDependentTypesAreResolved([structType], fieldTypes, (fieldTypes) => {
        var fields = {};
        fieldRecords.forEach((field, i) => {
          var fieldName = field.fieldName;
          var getterReturnType = fieldTypes[i];
          var getter = field.getter;
          var getterContext = field.getterContext;
          var setterArgumentType = fieldTypes[i + fieldRecords.length];
          var setter = field.setter;
          var setterContext = field.setterContext;
          fields[fieldName] = {
            read: (ptr) => getterReturnType['fromWireType'](getter(getterContext, ptr)),
            write: (ptr, o) => {
              var destructors = [];
              setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, o));
              runDestructors(destructors);
            }
          };
        });
  
        return [{
          name: reg.name,
          'fromWireType': (ptr) => {
            var rv = {};
            for (var i in fields) {
              rv[i] = fields[i].read(ptr);
            }
            rawDestructor(ptr);
            return rv;
          },
          'toWireType': (destructors, o) => {
            // todo: Here we have an opportunity for -O3 level "unsafe" optimizations:
            // assume all fields are present without checking.
            for (var fieldName in fields) {
              if (!(fieldName in o)) {
                throw new TypeError(`Missing field: "${fieldName}"`);
              }
            }
            var ptr = rawConstructor();
            for (fieldName in fields) {
              fields[fieldName].write(ptr, o[fieldName]);
            }
            if (destructors !== null) {
              destructors.push(rawDestructor, ptr);
            }
            return ptr;
          },
          argPackAdvance: GenericWireTypeSize,
          'readValueFromPointer': readPointer,
          destructorFunction: rawDestructor,
        }];
      });
    };

  var __embind_register_bigint = (primitiveType, name, size, minRange, maxRange) => {};

  var embind_init_charCodes = () => {
      var codes = new Array(256);
      for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
      }
      embind_charCodes = codes;
    };
  var embind_charCodes;
  var readLatin1String = (ptr) => {
      var ret = "";
      var c = ptr;
      while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
      }
      return ret;
    };
  
  
  
  
  var BindingError;
  var throwBindingError = (message) => { throw new BindingError(message); };
  
  /** @param {Object=} options */
  function sharedRegisterType(rawType, registeredInstance, options = {}) {
      var name = registeredInstance.name;
      if (!rawType) {
        throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
          return;
        } else {
          throwBindingError(`Cannot register type '${name}' twice`);
        }
      }
  
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
  
      if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach((cb) => cb());
      }
    }
  /** @param {Object=} options */
  function registerType(rawType, registeredInstance, options = {}) {
      if (registeredInstance.argPackAdvance === undefined) {
        throw new TypeError('registerType registeredInstance requires argPackAdvance');
      }
      return sharedRegisterType(rawType, registeredInstance, options);
    }
  
  var GenericWireTypeSize = 8;
  /** @suppress {globalThis} */
  var __embind_register_bool = (rawType, name, trueValue, falseValue) => {
      name = readLatin1String(name);
      registerType(rawType, {
          name,
          'fromWireType': function(wt) {
              // ambiguous emscripten ABI: sometimes return values are
              // true or false, and sometimes integers (0 or 1)
              return !!wt;
          },
          'toWireType': function(destructors, o) {
              return o ? trueValue : falseValue;
          },
          argPackAdvance: GenericWireTypeSize,
          'readValueFromPointer': function(pointer) {
              return this['fromWireType'](HEAPU8[pointer]);
          },
          destructorFunction: null, // This type does not need a destructor
      });
    };

  
  
  var shallowCopyInternalPointer = (o) => {
      return {
        count: o.count,
        deleteScheduled: o.deleteScheduled,
        preservePointerOnDelete: o.preservePointerOnDelete,
        ptr: o.ptr,
        ptrType: o.ptrType,
        smartPtr: o.smartPtr,
        smartPtrType: o.smartPtrType,
      };
    };
  
  var throwInstanceAlreadyDeleted = (obj) => {
      function getInstanceTypeName(handle) {
        return handle.$$.ptrType.registeredClass.name;
      }
      throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
    };
  
  var finalizationRegistry = false;
  
  var detachFinalizer = (handle) => {};
  
  var runDestructor = ($$) => {
      if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr);
      } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr);
      }
    };
  var releaseClassHandle = ($$) => {
      $$.count.value -= 1;
      var toDelete = 0 === $$.count.value;
      if (toDelete) {
        runDestructor($$);
      }
    };
  
  var downcastPointer = (ptr, ptrClass, desiredClass) => {
      if (ptrClass === desiredClass) {
        return ptr;
      }
      if (undefined === desiredClass.baseClass) {
        return null; // no conversion
      }
  
      var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
      if (rv === null) {
        return null;
      }
      return desiredClass.downcast(rv);
    };
  
  var registeredPointers = {
  };
  
  var registeredInstances = {
  };
  
  var getBasestPointer = (class_, ptr) => {
      if (ptr === undefined) {
          throwBindingError('ptr should not be undefined');
      }
      while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
      }
      return ptr;
    };
  var getInheritedInstance = (class_, ptr) => {
      ptr = getBasestPointer(class_, ptr);
      return registeredInstances[ptr];
    };
  
  
  var makeClassHandle = (prototype, record) => {
      if (!record.ptrType || !record.ptr) {
        throwInternalError('makeClassHandle requires ptr and ptrType');
      }
      var hasSmartPtrType = !!record.smartPtrType;
      var hasSmartPtr = !!record.smartPtr;
      if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError('Both smartPtrType and smartPtr must be specified');
      }
      record.count = { value: 1 };
      return attachFinalizer(Object.create(prototype, {
        $$: {
          value: record,
          writable: true,
        },
      }));
    };
  /** @suppress {globalThis} */
  function RegisteredPointer_fromWireType(ptr) {
      // ptr is a raw pointer (or a raw smartpointer)
  
      // rawPointer is a maybe-null raw pointer
      var rawPointer = this.getPointee(ptr);
      if (!rawPointer) {
        this.destructor(ptr);
        return null;
      }
  
      var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
      if (undefined !== registeredInstance) {
        // JS object has been neutered, time to repopulate it
        if (0 === registeredInstance.$$.count.value) {
          registeredInstance.$$.ptr = rawPointer;
          registeredInstance.$$.smartPtr = ptr;
          return registeredInstance['clone']();
        } else {
          // else, just increment reference count on existing object
          // it already has a reference to the smart pointer
          var rv = registeredInstance['clone']();
          this.destructor(ptr);
          return rv;
        }
      }
  
      function makeDefaultHandle() {
        if (this.isSmartPointer) {
          return makeClassHandle(this.registeredClass.instancePrototype, {
            ptrType: this.pointeeType,
            ptr: rawPointer,
            smartPtrType: this,
            smartPtr: ptr,
          });
        } else {
          return makeClassHandle(this.registeredClass.instancePrototype, {
            ptrType: this,
            ptr,
          });
        }
      }
  
      var actualType = this.registeredClass.getActualType(rawPointer);
      var registeredPointerRecord = registeredPointers[actualType];
      if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this);
      }
  
      var toType;
      if (this.isConst) {
        toType = registeredPointerRecord.constPointerType;
      } else {
        toType = registeredPointerRecord.pointerType;
      }
      var dp = downcastPointer(
          rawPointer,
          this.registeredClass,
          toType.registeredClass);
      if (dp === null) {
        return makeDefaultHandle.call(this);
      }
      if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
          ptrType: toType,
          ptr: dp,
          smartPtrType: this,
          smartPtr: ptr,
        });
      } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
          ptrType: toType,
          ptr: dp,
        });
      }
    }
  var attachFinalizer = (handle) => {
      if ('undefined' === typeof FinalizationRegistry) {
        attachFinalizer = (handle) => handle;
        return handle;
      }
      // If the running environment has a FinalizationRegistry (see
      // https://github.com/tc39/proposal-weakrefs), then attach finalizers
      // for class handles.  We check for the presence of FinalizationRegistry
      // at run-time, not build-time.
      finalizationRegistry = new FinalizationRegistry((info) => {
        console.warn(info.leakWarning);
        releaseClassHandle(info.$$);
      });
      attachFinalizer = (handle) => {
        var $$ = handle.$$;
        var hasSmartPtr = !!$$.smartPtr;
        if (hasSmartPtr) {
          // We should not call the destructor on raw pointers in case other code expects the pointee to live
          var info = { $$: $$ };
          // Create a warning as an Error instance in advance so that we can store
          // the current stacktrace and point to it when / if a leak is detected.
          // This is more useful than the empty stacktrace of `FinalizationRegistry`
          // callback.
          var cls = $$.ptrType.registeredClass;
          var err = new Error(`Embind found a leaked C++ instance ${cls.name} <${ptrToString($$.ptr)}>.\n` +
          "We'll free it automatically in this case, but this functionality is not reliable across various environments.\n" +
          "Make sure to invoke .delete() manually once you're done with the instance instead.\n" +
          "Originally allocated"); // `.stack` will add "at ..." after this sentence
          if ('captureStackTrace' in Error) {
            Error.captureStackTrace(err, RegisteredPointer_fromWireType);
          }
          info.leakWarning = err.stack.replace(/^Error: /, '');
          finalizationRegistry.register(handle, info, handle);
        }
        return handle;
      };
      detachFinalizer = (handle) => finalizationRegistry.unregister(handle);
      return attachFinalizer(handle);
    };
  
  
  
  
  var deletionQueue = [];
  var flushPendingDeletes = () => {
      while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj['delete']();
      }
    };
  
  var delayFunction;
  var init_ClassHandle = () => {
      Object.assign(ClassHandle.prototype, {
        "isAliasOf"(other) {
          if (!(this instanceof ClassHandle)) {
            return false;
          }
          if (!(other instanceof ClassHandle)) {
            return false;
          }
  
          var leftClass = this.$$.ptrType.registeredClass;
          var left = this.$$.ptr;
          other.$$ = /** @type {Object} */ (other.$$);
          var rightClass = other.$$.ptrType.registeredClass;
          var right = other.$$.ptr;
  
          while (leftClass.baseClass) {
            left = leftClass.upcast(left);
            leftClass = leftClass.baseClass;
          }
  
          while (rightClass.baseClass) {
            right = rightClass.upcast(right);
            rightClass = rightClass.baseClass;
          }
  
          return leftClass === rightClass && left === right;
        },
  
        "clone"() {
          if (!this.$$.ptr) {
            throwInstanceAlreadyDeleted(this);
          }
  
          if (this.$$.preservePointerOnDelete) {
            this.$$.count.value += 1;
            return this;
          } else {
            var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), {
              $$: {
                value: shallowCopyInternalPointer(this.$$),
              }
            }));
  
            clone.$$.count.value += 1;
            clone.$$.deleteScheduled = false;
            return clone;
          }
        },
  
        "delete"() {
          if (!this.$$.ptr) {
            throwInstanceAlreadyDeleted(this);
          }
  
          if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
            throwBindingError('Object already scheduled for deletion');
          }
  
          detachFinalizer(this);
          releaseClassHandle(this.$$);
  
          if (!this.$$.preservePointerOnDelete) {
            this.$$.smartPtr = undefined;
            this.$$.ptr = undefined;
          }
        },
  
        "isDeleted"() {
          return !this.$$.ptr;
        },
  
        "deleteLater"() {
          if (!this.$$.ptr) {
            throwInstanceAlreadyDeleted(this);
          }
          if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
            throwBindingError('Object already scheduled for deletion');
          }
          deletionQueue.push(this);
          if (deletionQueue.length === 1 && delayFunction) {
            delayFunction(flushPendingDeletes);
          }
          this.$$.deleteScheduled = true;
          return this;
        },
      });
    };
  /** @constructor */
  function ClassHandle() {
    }
  
  var createNamedFunction = (name, body) => Object.defineProperty(body, 'name', {
      value: name
    });
  
  
  var ensureOverloadTable = (proto, methodName, humanName) => {
      if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        // Inject an overload resolver function that routes to the appropriate overload based on the number of arguments.
        proto[methodName] = function(...args) {
          // TODO This check can be removed in -O3 level "unsafe" optimizations.
          if (!proto[methodName].overloadTable.hasOwnProperty(args.length)) {
            throwBindingError(`Function '${humanName}' called with an invalid number of arguments (${args.length}) - expects one of (${proto[methodName].overloadTable})!`);
          }
          return proto[methodName].overloadTable[args.length].apply(this, args);
        };
        // Move the previous function into the overload table.
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
      }
    };
  
  /** @param {number=} numArguments */
  var exposePublicSymbol = (name, value, numArguments) => {
      if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
          throwBindingError(`Cannot register public name '${name}' twice`);
        }
  
        // We are exposing a function with the same name as an existing function. Create an overload table and a function selector
        // that routes between the two.
        ensureOverloadTable(Module, name, name);
        if (Module[name].overloadTable.hasOwnProperty(numArguments)) {
          throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`);
        }
        // Add the new function into the overload table.
        Module[name].overloadTable[numArguments] = value;
      } else {
        Module[name] = value;
        Module[name].argCount = numArguments;
      }
    };
  
  var char_0 = 48;
  
  var char_9 = 57;
  var makeLegalFunctionName = (name) => {
      assert(typeof name === 'string');
      name = name.replace(/[^a-zA-Z0-9_]/g, '$');
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
        return `_${name}`;
      }
      return name;
    };
  
  
  /** @constructor */
  function RegisteredClass(name,
                               constructor,
                               instancePrototype,
                               rawDestructor,
                               baseClass,
                               getActualType,
                               upcast,
                               downcast) {
      this.name = name;
      this.constructor = constructor;
      this.instancePrototype = instancePrototype;
      this.rawDestructor = rawDestructor;
      this.baseClass = baseClass;
      this.getActualType = getActualType;
      this.upcast = upcast;
      this.downcast = downcast;
      this.pureVirtualFunctions = [];
    }
  
  
  var upcastPointer = (ptr, ptrClass, desiredClass) => {
      while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
          throwBindingError(`Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`);
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass;
      }
      return ptr;
    };
  /** @suppress {globalThis} */
  function constNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError(`null is not a valid ${this.name}`);
        }
        return 0;
      }
  
      if (!handle.$$) {
        throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
      }
      if (!handle.$$.ptr) {
        throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
  
  
  /** @suppress {globalThis} */
  function genericPointerToWireType(destructors, handle) {
      var ptr;
      if (handle === null) {
        if (this.isReference) {
          throwBindingError(`null is not a valid ${this.name}`);
        }
  
        if (this.isSmartPointer) {
          ptr = this.rawConstructor();
          if (destructors !== null) {
            destructors.push(this.rawDestructor, ptr);
          }
          return ptr;
        } else {
          return 0;
        }
      }
  
      if (!handle || !handle.$$) {
        throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
      }
      if (!handle.$$.ptr) {
        throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
      }
      if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError(`Cannot convert argument of type ${(handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name)} to parameter type ${this.name}`);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
  
      if (this.isSmartPointer) {
        // TODO: this is not strictly true
        // We could support BY_EMVAL conversions from raw pointers to smart pointers
        // because the smart pointer can hold a reference to the handle
        if (undefined === handle.$$.smartPtr) {
          throwBindingError('Passing raw pointer to smart pointer is illegal');
        }
  
        switch (this.sharingPolicy) {
          case 0: // NONE
            // no upcasting
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              throwBindingError(`Cannot convert argument of type ${(handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name)} to parameter type ${this.name}`);
            }
            break;
  
          case 1: // INTRUSIVE
            ptr = handle.$$.smartPtr;
            break;
  
          case 2: // BY_EMVAL
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              var clonedHandle = handle['clone']();
              ptr = this.rawShare(
                ptr,
                Emval.toHandle(() => clonedHandle['delete']())
              );
              if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr);
              }
            }
            break;
  
          default:
            throwBindingError('Unsupporting sharing policy');
        }
      }
      return ptr;
    }
  
  
  /** @suppress {globalThis} */
  function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError(`null is not a valid ${this.name}`);
        }
        return 0;
      }
  
      if (!handle.$$) {
        throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
      }
      if (!handle.$$.ptr) {
        throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
      }
      if (handle.$$.ptrType.isConst) {
          throwBindingError(`Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
  
  
  
  
  var init_RegisteredPointer = () => {
      Object.assign(RegisteredPointer.prototype, {
        getPointee(ptr) {
          if (this.rawGetPointee) {
            ptr = this.rawGetPointee(ptr);
          }
          return ptr;
        },
        destructor(ptr) {
          this.rawDestructor?.(ptr);
        },
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': readPointer,
        'fromWireType': RegisteredPointer_fromWireType,
      });
    };
  /** @constructor
      @param {*=} pointeeType,
      @param {*=} sharingPolicy,
      @param {*=} rawGetPointee,
      @param {*=} rawConstructor,
      @param {*=} rawShare,
      @param {*=} rawDestructor,
       */
  function RegisteredPointer(
      name,
      registeredClass,
      isReference,
      isConst,
  
      // smart pointer properties
      isSmartPointer,
      pointeeType,
      sharingPolicy,
      rawGetPointee,
      rawConstructor,
      rawShare,
      rawDestructor
    ) {
      this.name = name;
      this.registeredClass = registeredClass;
      this.isReference = isReference;
      this.isConst = isConst;
  
      // smart pointer properties
      this.isSmartPointer = isSmartPointer;
      this.pointeeType = pointeeType;
      this.sharingPolicy = sharingPolicy;
      this.rawGetPointee = rawGetPointee;
      this.rawConstructor = rawConstructor;
      this.rawShare = rawShare;
      this.rawDestructor = rawDestructor;
  
      if (!isSmartPointer && registeredClass.baseClass === undefined) {
        if (isConst) {
          this['toWireType'] = constNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        } else {
          this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        }
      } else {
        this['toWireType'] = genericPointerToWireType;
        // Here we must leave this.destructorFunction undefined, since whether genericPointerToWireType returns
        // a pointer that needs to be freed up is runtime-dependent, and cannot be evaluated at registration time.
        // TODO: Create an alternative mechanism that allows removing the use of var destructors = []; array in
        //       craftInvokerFunction altogether.
      }
    }
  
  /** @param {number=} numArguments */
  var replacePublicSymbol = (name, value, numArguments) => {
      if (!Module.hasOwnProperty(name)) {
        throwInternalError('Replacing nonexistent public symbol');
      }
      // If there's an overload table for this symbol, replace the symbol in the overload table instead.
      if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value;
      } else {
        Module[name] = value;
        Module[name].argCount = numArguments;
      }
    };
  
  
  
  var dynCallLegacy = (sig, ptr, args) => {
      sig = sig.replace(/p/g, 'i')
      assert(('dynCall_' + sig) in Module, `bad function pointer type - dynCall function not found for sig '${sig}'`);
      if (args?.length) {
        // j (64-bit integer) must be passed in as two numbers [low 32, high 32].
        assert(args.length === sig.substring(1).replace(/j/g, '--').length);
      } else {
        assert(sig.length == 1);
      }
      var f = Module['dynCall_' + sig];
      return f(ptr, ...args);
    };
  
  var wasmTableMirror = [];
  
  /** @type {WebAssembly.Table} */
  var wasmTable;
  var getWasmTableEntry = (funcPtr) => {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        /** @suppress {checkTypes} */
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      /** @suppress {checkTypes} */
      assert(wasmTable.get(funcPtr) == func, 'JavaScript-side Wasm function table mirror is out of date!');
      return func;
    };
  
  var dynCall = (sig, ptr, args = []) => {
      // Without WASM_BIGINT support we cannot directly call function with i64 as
      // part of their signature, so we rely on the dynCall functions generated by
      // wasm-emscripten-finalize
      if (sig.includes('j')) {
        return dynCallLegacy(sig, ptr, args);
      }
      assert(getWasmTableEntry(ptr), `missing table entry in dynCall: ${ptr}`);
      var rtn = getWasmTableEntry(ptr)(...args);
      return rtn;
    };
  var getDynCaller = (sig, ptr) => {
      assert(sig.includes('j') || sig.includes('p'), 'getDynCaller should only be called with i64 sigs')
      return (...args) => dynCall(sig, ptr, args);
    };
  
  
  var embind__requireFunction = (signature, rawFunction) => {
      signature = readLatin1String(signature);
  
      function makeDynCaller() {
        if (signature.includes('j')) {
          return getDynCaller(signature, rawFunction);
        }
        return getWasmTableEntry(rawFunction);
      }
  
      var fp = makeDynCaller();
      if (typeof fp != "function") {
          throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
      }
      return fp;
    };
  
  
  
  var extendError = (baseErrorType, errorName) => {
      var errorClass = createNamedFunction(errorName, function(message) {
        this.name = errorName;
        this.message = message;
  
        var stack = (new Error(message)).stack;
        if (stack !== undefined) {
          this.stack = this.toString() + '\n' +
              stack.replace(/^Error(:[^\n]*)?\n/, '');
        }
      });
      errorClass.prototype = Object.create(baseErrorType.prototype);
      errorClass.prototype.constructor = errorClass;
      errorClass.prototype.toString = function() {
        if (this.message === undefined) {
          return this.name;
        } else {
          return `${this.name}: ${this.message}`;
        }
      };
  
      return errorClass;
    };
  var UnboundTypeError;
  
  
  
  var getTypeName = (type) => {
      var ptr = ___getTypeName(type);
      var rv = readLatin1String(ptr);
      _free(ptr);
      return rv;
    };
  var throwUnboundTypeError = (message, types) => {
      var unboundTypes = [];
      var seen = {};
      function visit(type) {
        if (seen[type]) {
          return;
        }
        if (registeredTypes[type]) {
          return;
        }
        if (typeDependencies[type]) {
          typeDependencies[type].forEach(visit);
          return;
        }
        unboundTypes.push(type);
        seen[type] = true;
      }
      types.forEach(visit);
  
      throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([', ']));
    };
  
  var __embind_register_class = (rawType,
                             rawPointerType,
                             rawConstPointerType,
                             baseClassRawType,
                             getActualTypeSignature,
                             getActualType,
                             upcastSignature,
                             upcast,
                             downcastSignature,
                             downcast,
                             name,
                             destructorSignature,
                             rawDestructor) => {
      name = readLatin1String(name);
      getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
      upcast &&= embind__requireFunction(upcastSignature, upcast);
      downcast &&= embind__requireFunction(downcastSignature, downcast);
      rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
      var legalFunctionName = makeLegalFunctionName(name);
  
      exposePublicSymbol(legalFunctionName, function() {
        // this code cannot run if baseClassRawType is zero
        throwUnboundTypeError(`Cannot construct ${name} due to unbound types`, [baseClassRawType]);
      });
  
      whenDependentTypesAreResolved(
        [rawType, rawPointerType, rawConstPointerType],
        baseClassRawType ? [baseClassRawType] : [],
        (base) => {
          base = base[0];
  
          var baseClass;
          var basePrototype;
          if (baseClassRawType) {
            baseClass = base.registeredClass;
            basePrototype = baseClass.instancePrototype;
          } else {
            basePrototype = ClassHandle.prototype;
          }
  
          var constructor = createNamedFunction(name, function(...args) {
            if (Object.getPrototypeOf(this) !== instancePrototype) {
              throw new BindingError("Use 'new' to construct " + name);
            }
            if (undefined === registeredClass.constructor_body) {
              throw new BindingError(name + " has no accessible constructor");
            }
            var body = registeredClass.constructor_body[args.length];
            if (undefined === body) {
              throw new BindingError(`Tried to invoke ctor of ${name} with invalid number of parameters (${args.length}) - expected (${Object.keys(registeredClass.constructor_body).toString()}) parameters instead!`);
            }
            return body.apply(this, args);
          });
  
          var instancePrototype = Object.create(basePrototype, {
            constructor: { value: constructor },
          });
  
          constructor.prototype = instancePrototype;
  
          var registeredClass = new RegisteredClass(name,
                                                    constructor,
                                                    instancePrototype,
                                                    rawDestructor,
                                                    baseClass,
                                                    getActualType,
                                                    upcast,
                                                    downcast);
  
          if (registeredClass.baseClass) {
            // Keep track of class hierarchy. Used to allow sub-classes to inherit class functions.
            registeredClass.baseClass.__derivedClasses ??= [];
  
            registeredClass.baseClass.__derivedClasses.push(registeredClass);
          }
  
          var referenceConverter = new RegisteredPointer(name,
                                                         registeredClass,
                                                         true,
                                                         false,
                                                         false);
  
          var pointerConverter = new RegisteredPointer(name + '*',
                                                       registeredClass,
                                                       false,
                                                       false,
                                                       false);
  
          var constPointerConverter = new RegisteredPointer(name + ' const*',
                                                            registeredClass,
                                                            false,
                                                            true,
                                                            false);
  
          registeredPointers[rawType] = {
            pointerType: pointerConverter,
            constPointerType: constPointerConverter
          };
  
          replacePublicSymbol(legalFunctionName, constructor);
  
          return [referenceConverter, pointerConverter, constPointerConverter];
        }
      );
    };

  var heap32VectorToArray = (count, firstElement) => {
      var array = [];
      for (var i = 0; i < count; i++) {
        // TODO(https://github.com/emscripten-core/emscripten/issues/17310):
        // Find a way to hoist the `>> 2` or `>> 3` out of this loop.
        array.push(HEAPU32[(((firstElement)+(i * 4))>>2)]);
      }
      return array;
    };
  
  
  
  
  
  
  
  
  
  function usesDestructorStack(argTypes) {
      // Skip return value at index 0 - it's not deleted here.
      for (var i = 1; i < argTypes.length; ++i) {
        // The type does not define a destructor function - must use dynamic stack
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
          return true;
        }
      }
      return false;
    }
  
  function newFunc(constructor, argumentList) {
      if (!(constructor instanceof Function)) {
        throw new TypeError(`new_ called with constructor type ${typeof(constructor)} which is not a function`);
      }
      /*
       * Previously, the following line was just:
       *   function dummy() {};
       * Unfortunately, Chrome was preserving 'dummy' as the object's name, even
       * though at creation, the 'dummy' has the correct constructor name.  Thus,
       * objects created with IMVU.new would show up in the debugger as 'dummy',
       * which isn't very helpful.  Using IMVU.createNamedFunction addresses the
       * issue.  Doubly-unfortunately, there's no way to write a test for this
       * behavior.  -NRD 2013.02.22
       */
      var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function(){});
      dummy.prototype = constructor.prototype;
      var obj = new dummy;
  
      var r = constructor.apply(obj, argumentList);
      return (r instanceof Object) ? r : obj;
    }
  
  
  function checkArgCount(numArgs, minArgs, maxArgs, humanName, throwBindingError) {
      if (numArgs < minArgs || numArgs > maxArgs) {
        var argCountMessage = minArgs == maxArgs ? minArgs : `${minArgs} to ${maxArgs}`;
        throwBindingError(`function ${humanName} called with ${numArgs} arguments, expected ${argCountMessage}`);
      }
    }
  function createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync) {
      var needsDestructorStack = usesDestructorStack(argTypes);
      var argCount = argTypes.length - 2;
      var argsList = [];
      var argsListWired = ['fn'];
      if (isClassMethodFunc) {
        argsListWired.push('thisWired');
      }
      for (var i = 0; i < argCount; ++i) {
        argsList.push(`arg${i}`)
        argsListWired.push(`arg${i}Wired`)
      }
      argsList = argsList.join(',')
      argsListWired = argsListWired.join(',')
  
      var invokerFnBody = `return function (${argsList}) {\n`;
  
      invokerFnBody += "checkArgCount(arguments.length, minArgs, maxArgs, humanName, throwBindingError);\n";
  
      if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n";
      }
  
      var dtorStack = needsDestructorStack ? "destructors" : "null";
      var args1 = ["humanName", "throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
  
      if (isClassMethodFunc) {
        invokerFnBody += `var thisWired = classParam['toWireType'](${dtorStack}, this);\n`;
      }
  
      for (var i = 0; i < argCount; ++i) {
        invokerFnBody += `var arg${i}Wired = argType${i}['toWireType'](${dtorStack}, arg${i});\n`;
        args1.push(`argType${i}`);
      }
  
      invokerFnBody += (returns || isAsync ? "var rv = ":"") + `invoker(${argsListWired});\n`;
  
      var returnVal = returns ? "rv" : "";
  
      if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
      } else {
        for (var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
          var paramName = (i === 1 ? "thisWired" : ("arg"+(i - 2)+"Wired"));
          if (argTypes[i].destructorFunction !== null) {
            invokerFnBody += `${paramName}_dtor(${paramName});\n`;
            args1.push(`${paramName}_dtor`);
          }
        }
      }
  
      if (returns) {
        invokerFnBody += "var ret = retType['fromWireType'](rv);\n" +
                         "return ret;\n";
      } else {
      }
  
      invokerFnBody += "}\n";
  
      args1.push('checkArgCount', 'minArgs', 'maxArgs');
      invokerFnBody = `if (arguments.length !== ${args1.length}){ throw new Error(humanName + "Expected ${args1.length} closure arguments " + arguments.length + " given."); }\n${invokerFnBody}`;
      return [args1, invokerFnBody];
    }
  
  function getRequiredArgCount(argTypes) {
      var requiredArgCount = argTypes.length - 2;
      for (var i = argTypes.length - 1; i >= 2; --i) {
        if (!argTypes[i].optional) {
          break;
        }
        requiredArgCount--;
      }
      return requiredArgCount;
    }
  
  function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, /** boolean= */ isAsync) {
      // humanName: a human-readable string name for the function to be generated.
      // argTypes: An array that contains the embind type objects for all types in the function signature.
      //    argTypes[0] is the type object for the function return value.
      //    argTypes[1] is the type object for function this object/class type, or null if not crafting an invoker for a class method.
      //    argTypes[2...] are the actual function parameters.
      // classType: The embind type object for the class to be bound, or null if this is not a method of a class.
      // cppInvokerFunc: JS Function object to the C++-side function that interops into C++ code.
      // cppTargetFunc: Function pointer (an integer to FUNCTION_TABLE) to the target C++ function the cppInvokerFunc will end up calling.
      // isAsync: Optional. If true, returns an async function. Async bindings are only supported with JSPI.
      var argCount = argTypes.length;
  
      if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
      }
  
      assert(!isAsync, 'Async bindings are only supported with JSPI.');
  
      var isClassMethodFunc = (argTypes[1] !== null && classType !== null);
  
      // Free functions with signature "void function()" do not need an invoker that marshalls between wire types.
  // TODO: This omits argument count check - enable only at -O3 or similar.
  //    if (ENABLE_UNSAFE_OPTS && argCount == 2 && argTypes[0].name == "void" && !isClassMethodFunc) {
  //       return FUNCTION_TABLE[fn];
  //    }
  
      // Determine if we need to use a dynamic stack to store the destructors for the function parameters.
      // TODO: Remove this completely once all function invokers are being dynamically generated.
      var needsDestructorStack = usesDestructorStack(argTypes);
  
      var returns = (argTypes[0].name !== "void");
  
      var expectedArgCount = argCount - 2;
      var minArgs = getRequiredArgCount(argTypes);
    // Builld the arguments that will be passed into the closure around the invoker
    // function.
    var closureArgs = [humanName, throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
    for (var i = 0; i < argCount - 2; ++i) {
      closureArgs.push(argTypes[i+2]);
    }
    if (!needsDestructorStack) {
      for (var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
        if (argTypes[i].destructorFunction !== null) {
          closureArgs.push(argTypes[i].destructorFunction);
        }
      }
    }
    closureArgs.push(checkArgCount, minArgs, expectedArgCount);
  
    let [args, invokerFnBody] = createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync);
    args.push(invokerFnBody);
    var invokerFn = newFunc(Function, args)(...closureArgs);
      return createNamedFunction(humanName, invokerFn);
    }
  var __embind_register_class_constructor = (
      rawClassType,
      argCount,
      rawArgTypesAddr,
      invokerSignature,
      invoker,
      rawConstructor
    ) => {
      assert(argCount > 0);
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      invoker = embind__requireFunction(invokerSignature, invoker);
      var args = [rawConstructor];
      var destructors = [];
  
      whenDependentTypesAreResolved([], [rawClassType], (classType) => {
        classType = classType[0];
        var humanName = `constructor ${classType.name}`;
  
        if (undefined === classType.registeredClass.constructor_body) {
          classType.registeredClass.constructor_body = [];
        }
        if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
          throw new BindingError(`Cannot register multiple constructors with identical number of parameters (${argCount-1}) for class '${classType.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        }
        classType.registeredClass.constructor_body[argCount - 1] = () => {
          throwUnboundTypeError(`Cannot construct ${classType.name} due to unbound types`, rawArgTypes);
        };
  
        whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
          // Insert empty slot for context type (argTypes[1]).
          argTypes.splice(1, 0, null);
          classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
          return [];
        });
        return [];
      });
    };

  
  
  
  
  
  
  var getFunctionName = (signature) => {
      signature = signature.trim();
      const argsIndex = signature.indexOf("(");
      if (argsIndex !== -1) {
        assert(signature[signature.length - 1] == ")", "Parentheses for argument names should match.");
        return signature.substr(0, argsIndex);
      } else {
        return signature;
      }
    };
  var __embind_register_class_function = (rawClassType,
                                      methodName,
                                      argCount,
                                      rawArgTypesAddr, // [ReturnType, ThisType, Args...]
                                      invokerSignature,
                                      rawInvoker,
                                      context,
                                      isPureVirtual,
                                      isAsync,
                                      isNonnullReturn) => {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      methodName = readLatin1String(methodName);
      methodName = getFunctionName(methodName);
      rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
  
      whenDependentTypesAreResolved([], [rawClassType], (classType) => {
        classType = classType[0];
        var humanName = `${classType.name}.${methodName}`;
  
        if (methodName.startsWith("@@")) {
          methodName = Symbol[methodName.substring(2)];
        }
  
        if (isPureVirtual) {
          classType.registeredClass.pureVirtualFunctions.push(methodName);
        }
  
        function unboundTypesHandler() {
          throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`, rawArgTypes);
        }
  
        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (undefined === method || (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2)) {
          // This is the first overload to be registered, OR we are replacing a
          // function in the base class with a function in the derived class.
          unboundTypesHandler.argCount = argCount - 2;
          unboundTypesHandler.className = classType.name;
          proto[methodName] = unboundTypesHandler;
        } else {
          // There was an existing function with the same name registered. Set up
          // a function overload routing table.
          ensureOverloadTable(proto, methodName, humanName);
          proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
        }
  
        whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
          var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context, isAsync);
  
          // Replace the initial unbound-handler-stub function with the
          // appropriate member function, now that all types are resolved. If
          // multiple overloads are registered for this function, the function
          // goes into an overload table.
          if (undefined === proto[methodName].overloadTable) {
            // Set argCount in case an overload is registered later
            memberFunction.argCount = argCount - 2;
            proto[methodName] = memberFunction;
          } else {
            proto[methodName].overloadTable[argCount - 2] = memberFunction;
          }
  
          return [];
        });
        return [];
      });
    };

  
  var emval_freelist = [];
  
  var emval_handles = [];
  var __emval_decref = (handle) => {
      if (handle > 9 && 0 === --emval_handles[handle + 1]) {
        assert(emval_handles[handle] !== undefined, `Decref for unallocated handle.`);
        emval_handles[handle] = undefined;
        emval_freelist.push(handle);
      }
    };
  
  
  
  
  
  var count_emval_handles = () => {
      return emval_handles.length / 2 - 5 - emval_freelist.length;
    };
  
  var init_emval = () => {
      // reserve 0 and some special values. These never get de-allocated.
      emval_handles.push(
        0, 1,
        undefined, 1,
        null, 1,
        true, 1,
        false, 1,
      );
      assert(emval_handles.length === 5 * 2);
      Module['count_emval_handles'] = count_emval_handles;
    };
  var Emval = {
  toValue:(handle) => {
        if (!handle) {
            throwBindingError('Cannot use deleted val. handle = ' + handle);
        }
        // handle 2 is supposed to be `undefined`.
        assert(handle === 2 || emval_handles[handle] !== undefined && handle % 2 === 0, `invalid handle: ${handle}`);
        return emval_handles[handle];
      },
  toHandle:(value) => {
        switch (value) {
          case undefined: return 2;
          case null: return 4;
          case true: return 6;
          case false: return 8;
          default:{
            const handle = emval_freelist.pop() || emval_handles.length;
            emval_handles[handle] = value;
            emval_handles[handle + 1] = 1;
            return handle;
          }
        }
      },
  };
  
  
  var EmValType = {
      name: 'emscripten::val',
      'fromWireType': (handle) => {
        var rv = Emval.toValue(handle);
        __emval_decref(handle);
        return rv;
      },
      'toWireType': (destructors, value) => Emval.toHandle(value),
      argPackAdvance: GenericWireTypeSize,
      'readValueFromPointer': readPointer,
      destructorFunction: null, // This type does not need a destructor
  
      // TODO: do we need a deleteObject here?  write a test where
      // emval is passed into JS via an interface
    };
  var __embind_register_emval = (rawType) => registerType(rawType, EmValType);

  var embindRepr = (v) => {
      if (v === null) {
          return 'null';
      }
      var t = typeof v;
      if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
      } else {
          return '' + v;
      }
    };
  
  var floatReadValueFromPointer = (name, width) => {
      switch (width) {
          case 4: return function(pointer) {
              return this['fromWireType'](HEAPF32[((pointer)>>2)]);
          };
          case 8: return function(pointer) {
              return this['fromWireType'](HEAPF64[((pointer)>>3)]);
          };
          default:
              throw new TypeError(`invalid float width (${width}): ${name}`);
      }
    };
  
  
  var __embind_register_float = (rawType, name, size) => {
      name = readLatin1String(name);
      registerType(rawType, {
        name,
        'fromWireType': (value) => value,
        'toWireType': (destructors, value) => {
          if (typeof value != "number" && typeof value != "boolean") {
            throw new TypeError(`Cannot convert ${embindRepr(value)} to ${this.name}`);
          }
          // The VM will perform JS to Wasm value conversion, according to the spec:
          // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
          return value;
        },
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': floatReadValueFromPointer(name, size),
        destructorFunction: null, // This type does not need a destructor
      });
    };

  
  var integerReadValueFromPointer = (name, width, signed) => {
      // integers are quite common, so generate very specialized functions
      switch (width) {
          case 1: return signed ?
              (pointer) => HEAP8[pointer] :
              (pointer) => HEAPU8[pointer];
          case 2: return signed ?
              (pointer) => HEAP16[((pointer)>>1)] :
              (pointer) => HEAPU16[((pointer)>>1)]
          case 4: return signed ?
              (pointer) => HEAP32[((pointer)>>2)] :
              (pointer) => HEAPU32[((pointer)>>2)]
          default:
              throw new TypeError(`invalid integer width (${width}): ${name}`);
      }
    };
  
  
  /** @suppress {globalThis} */
  var __embind_register_integer = (primitiveType, name, size, minRange, maxRange) => {
      name = readLatin1String(name);
      // LLVM doesn't have signed and unsigned 32-bit types, so u32 literals come
      // out as 'i32 -1'. Always treat those as max u32.
      if (maxRange === -1) {
        maxRange = 4294967295;
      }
  
      var fromWireType = (value) => value;
  
      if (minRange === 0) {
        var bitshift = 32 - 8*size;
        fromWireType = (value) => (value << bitshift) >>> bitshift;
      }
  
      var isUnsignedType = (name.includes('unsigned'));
      var checkAssertions = (value, toTypeName) => {
        if (typeof value != "number" && typeof value != "boolean") {
          throw new TypeError(`Cannot convert "${embindRepr(value)}" to ${toTypeName}`);
        }
        if (value < minRange || value > maxRange) {
          throw new TypeError(`Passing a number "${embindRepr(value)}" from JS side to C/C++ side to an argument of type "${name}", which is outside the valid range [${minRange}, ${maxRange}]!`);
        }
      }
      var toWireType;
      if (isUnsignedType) {
        toWireType = function(destructors, value) {
          checkAssertions(value, this.name);
          return value >>> 0;
        }
      } else {
        toWireType = function(destructors, value) {
          checkAssertions(value, this.name);
          // The VM will perform JS to Wasm value conversion, according to the spec:
          // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
          return value;
        }
      }
      registerType(primitiveType, {
        name,
        'fromWireType': fromWireType,
        'toWireType': toWireType,
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': integerReadValueFromPointer(name, size, minRange !== 0),
        destructorFunction: null, // This type does not need a destructor
      });
    };

  
  var __embind_register_memory_view = (rawType, dataTypeIndex, name) => {
      var typeMapping = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
      ];
  
      var TA = typeMapping[dataTypeIndex];
  
      function decodeMemoryView(handle) {
        var size = HEAPU32[((handle)>>2)];
        var data = HEAPU32[(((handle)+(4))>>2)];
        return new TA(HEAP8.buffer, data, size);
      }
  
      name = readLatin1String(name);
      registerType(rawType, {
        name,
        'fromWireType': decodeMemoryView,
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': decodeMemoryView,
      }, {
        ignoreDuplicateRegistrations: true,
      });
    };

  
  
  
  
  var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    };
  
  
  
  
  var __embind_register_std_string = (rawType, name) => {
      name = readLatin1String(name);
      var stdStringIsUTF8
      //process only std::string bindings with UTF8 support, in contrast to e.g. std::basic_string<unsigned char>
      = (name === "std::string");
  
      registerType(rawType, {
        name,
        // For some method names we use string keys here since they are part of
        // the public/external API and/or used by the runtime-generated code.
        'fromWireType'(value) {
          var length = HEAPU32[((value)>>2)];
          var payload = value + 4;
  
          var str;
          if (stdStringIsUTF8) {
            var decodeStartPtr = payload;
            // Looping here to support possible embedded '0' bytes
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = payload + i;
              if (i == length || HEAPU8[currentBytePtr] == 0) {
                var maxRead = currentBytePtr - decodeStartPtr;
                var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                if (str === undefined) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + 1;
              }
            }
          } else {
            var a = new Array(length);
            for (var i = 0; i < length; ++i) {
              a[i] = String.fromCharCode(HEAPU8[payload + i]);
            }
            str = a.join('');
          }
  
          _free(value);
  
          return str;
        },
        'toWireType'(destructors, value) {
          if (value instanceof ArrayBuffer) {
            value = new Uint8Array(value);
          }
  
          var length;
          var valueIsOfTypeString = (typeof value == 'string');
  
          if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
            throwBindingError('Cannot pass non-string to std::string');
          }
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            length = lengthBytesUTF8(value);
          } else {
            length = value.length;
          }
  
          // assumes POINTER_SIZE alignment
          var base = _malloc(4 + length + 1);
          var ptr = base + 4;
          HEAPU32[((base)>>2)] = length;
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            stringToUTF8(value, ptr, length + 1);
          } else {
            if (valueIsOfTypeString) {
              for (var i = 0; i < length; ++i) {
                var charCode = value.charCodeAt(i);
                if (charCode > 255) {
                  _free(ptr);
                  throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                }
                HEAPU8[ptr + i] = charCode;
              }
            } else {
              for (var i = 0; i < length; ++i) {
                HEAPU8[ptr + i] = value[i];
              }
            }
          }
  
          if (destructors !== null) {
            destructors.push(_free, base);
          }
          return base;
        },
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': readPointer,
        destructorFunction(ptr) {
          _free(ptr);
        },
      });
    };

  
  
  
  var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;;
  var UTF16ToString = (ptr, maxBytesToRead) => {
      assert(ptr % 2 == 0, 'Pointer passed to UTF16ToString must be aligned to two bytes!');
      var endPtr = ptr;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.
      // Also, use the length info to avoid running tiny strings through
      // TextDecoder, since .subarray() allocates garbage.
      var idx = endPtr >> 1;
      var maxIdx = idx + maxBytesToRead / 2;
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
      endPtr = idx << 1;
  
      if (endPtr - ptr > 32 && UTF16Decoder)
        return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  
      // Fallback: decode without UTF16Decoder
      var str = '';
  
      // If maxBytesToRead is not passed explicitly, it will be undefined, and the
      // for-loop's condition will always evaluate to true. The loop is then
      // terminated on the first null char.
      for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
        var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
        if (codeUnit == 0) break;
        // fromCharCode constructs a character from a UTF-16 code unit, so we can
        // pass the UTF16 string right through.
        str += String.fromCharCode(codeUnit);
      }
  
      return str;
    };
  
  var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
      assert(outPtr % 2 == 0, 'Pointer passed to stringToUTF16 must be aligned to two bytes!');
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      maxBytesToWrite ??= 0x7FFFFFFF;
      if (maxBytesToWrite < 2) return 0;
      maxBytesToWrite -= 2; // Null terminator.
      var startPtr = outPtr;
      var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
      for (var i = 0; i < numCharsToWrite; ++i) {
        // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        HEAP16[((outPtr)>>1)] = codeUnit;
        outPtr += 2;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP16[((outPtr)>>1)] = 0;
      return outPtr - startPtr;
    };
  
  var lengthBytesUTF16 = (str) => str.length*2;
  
  var UTF32ToString = (ptr, maxBytesToRead) => {
      assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
      var i = 0;
  
      var str = '';
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      while (!(i >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
        if (utf32 == 0) break;
        ++i;
        // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        if (utf32 >= 0x10000) {
          var ch = utf32 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    };
  
  var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
      assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      maxBytesToWrite ??= 0x7FFFFFFF;
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
          var trailSurrogate = str.charCodeAt(++i);
          codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
        }
        HEAP32[((outPtr)>>2)] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr) break;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP32[((outPtr)>>2)] = 0;
      return outPtr - startPtr;
    };
  
  var lengthBytesUTF32 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
        len += 4;
      }
  
      return len;
    };
  var __embind_register_std_wstring = (rawType, charSize, name) => {
      name = readLatin1String(name);
      var decodeString, encodeString, readCharAt, lengthBytesUTF;
      if (charSize === 2) {
        decodeString = UTF16ToString;
        encodeString = stringToUTF16;
        lengthBytesUTF = lengthBytesUTF16;
        readCharAt = (pointer) => HEAPU16[((pointer)>>1)];
      } else if (charSize === 4) {
        decodeString = UTF32ToString;
        encodeString = stringToUTF32;
        lengthBytesUTF = lengthBytesUTF32;
        readCharAt = (pointer) => HEAPU32[((pointer)>>2)];
      }
      registerType(rawType, {
        name,
        'fromWireType': (value) => {
          // Code mostly taken from _embind_register_std_string fromWireType
          var length = HEAPU32[((value)>>2)];
          var str;
  
          var decodeStartPtr = value + 4;
          // Looping here to support possible embedded '0' bytes
          for (var i = 0; i <= length; ++i) {
            var currentBytePtr = value + 4 + i * charSize;
            if (i == length || readCharAt(currentBytePtr) == 0) {
              var maxReadBytes = currentBytePtr - decodeStartPtr;
              var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
              if (str === undefined) {
                str = stringSegment;
              } else {
                str += String.fromCharCode(0);
                str += stringSegment;
              }
              decodeStartPtr = currentBytePtr + charSize;
            }
          }
  
          _free(value);
  
          return str;
        },
        'toWireType': (destructors, value) => {
          if (!(typeof value == 'string')) {
            throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
          }
  
          // assumes POINTER_SIZE alignment
          var length = lengthBytesUTF(value);
          var ptr = _malloc(4 + length + charSize);
          HEAPU32[((ptr)>>2)] = length / charSize;
  
          encodeString(value, ptr + 4, length + charSize);
  
          if (destructors !== null) {
            destructors.push(_free, ptr);
          }
          return ptr;
        },
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': readPointer,
        destructorFunction(ptr) {
          _free(ptr);
        }
      });
    };

  
  
  var __embind_register_value_object = (
      rawType,
      name,
      constructorSignature,
      rawConstructor,
      destructorSignature,
      rawDestructor
    ) => {
      structRegistrations[rawType] = {
        name: readLatin1String(name),
        rawConstructor: embind__requireFunction(constructorSignature, rawConstructor),
        rawDestructor: embind__requireFunction(destructorSignature, rawDestructor),
        fields: [],
      };
    };

  
  
  var __embind_register_value_object_field = (
      structType,
      fieldName,
      getterReturnType,
      getterSignature,
      getter,
      getterContext,
      setterArgumentType,
      setterSignature,
      setter,
      setterContext
    ) => {
      structRegistrations[structType].fields.push({
        fieldName: readLatin1String(fieldName),
        getterReturnType,
        getter: embind__requireFunction(getterSignature, getter),
        getterContext,
        setterArgumentType,
        setter: embind__requireFunction(setterSignature, setter),
        setterContext,
      });
    };

  
  var __embind_register_void = (rawType, name) => {
      name = readLatin1String(name);
      registerType(rawType, {
        isVoid: true, // void return values can be optimized out sometimes
        name,
        argPackAdvance: 0,
        'fromWireType': () => undefined,
        // TODO: assert if anything else is given?
        'toWireType': (destructors, o) => undefined,
      });
    };

  var __emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);


  
  
  
  var requireRegisteredType = (rawType, humanName) => {
      var impl = registeredTypes[rawType];
      if (undefined === impl) {
        throwBindingError(`${humanName} has unknown type ${getTypeName(rawType)}`);
      }
      return impl;
    };
  var __emval_take_value = (type, arg) => {
      type = requireRegisteredType(type, '_emval_take_value');
      var v = type['readValueFromPointer'](arg);
      return Emval.toHandle(v);
    };

  
  var __tzset_js = (timezone, daylight, std_name, dst_name) => {
      // TODO: Use (malleable) environment variables instead of system settings.
      var currentYear = new Date().getFullYear();
      var winter = new Date(currentYear, 0, 1);
      var summer = new Date(currentYear, 6, 1);
      var winterOffset = winter.getTimezoneOffset();
      var summerOffset = summer.getTimezoneOffset();
  
      // Local standard timezone offset. Local standard time is not adjusted for
      // daylight savings.  This code uses the fact that getTimezoneOffset returns
      // a greater value during Standard Time versus Daylight Saving Time (DST).
      // Thus it determines the expected output during Standard Time, and it
      // compares whether the output of the given date the same (Standard) or less
      // (DST).
      var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
  
      // timezone is specified as seconds west of UTC ("The external variable
      // `timezone` shall be set to the difference, in seconds, between
      // Coordinated Universal Time (UTC) and local standard time."), the same
      // as returned by stdTimezoneOffset.
      // See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
      HEAPU32[((timezone)>>2)] = stdTimezoneOffset * 60;
  
      HEAP32[((daylight)>>2)] = Number(winterOffset != summerOffset);
  
      var extractZone = (timezoneOffset) => {
        // Why inverse sign?
        // Read here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
        var sign = timezoneOffset >= 0 ? "-" : "+";
  
        var absOffset = Math.abs(timezoneOffset)
        var hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
        var minutes = String(absOffset % 60).padStart(2, "0");
  
        return `UTC${sign}${hours}${minutes}`;
      }
  
      var winterName = extractZone(winterOffset);
      var summerName = extractZone(summerOffset);
      assert(winterName);
      assert(summerName);
      assert(lengthBytesUTF8(winterName) <= 16, `timezone name truncated to fit in TZNAME_MAX (${winterName})`);
      assert(lengthBytesUTF8(summerName) <= 16, `timezone name truncated to fit in TZNAME_MAX (${summerName})`);
      if (summerOffset < winterOffset) {
        // Northern hemisphere
        stringToUTF8(winterName, std_name, 17);
        stringToUTF8(summerName, dst_name, 17);
      } else {
        stringToUTF8(winterName, dst_name, 17);
        stringToUTF8(summerName, std_name, 17);
      }
    };

  var getHeapMax = () =>
      HEAPU8.length;
  
  
  var abortOnCannotGrowMemory = (requestedSize) => {
      abort(`Cannot enlarge memory arrays to size ${requestedSize} bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ${HEAP8.length}, (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0`);
    };
  var _emscripten_resize_heap = (requestedSize) => {
      var oldSize = HEAPU8.length;
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      requestedSize >>>= 0;
      abortOnCannotGrowMemory(requestedSize);
    };

  var ENV = {
  };
  
  var getExecutableName = () => thisProgram || './this.program';
  var getEnvStrings = () => {
      if (!getEnvStrings.strings) {
        // Default values.
        // Browser language detection #8751
        var lang = ((typeof navigator == 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8';
        var env = {
          'USER': 'web_user',
          'LOGNAME': 'web_user',
          'PATH': '/',
          'PWD': '/',
          'HOME': '/home/web_user',
          'LANG': lang,
          '_': getExecutableName()
        };
        // Apply the user-provided values, if any.
        for (var x in ENV) {
          // x is a key in ENV; if ENV[x] is undefined, that means it was
          // explicitly set to be so. We allow user code to do that to
          // force variables with default values to remain unset.
          if (ENV[x] === undefined) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(`${x}=${env[x]}`);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    };
  
  var stringToAscii = (str, buffer) => {
      for (var i = 0; i < str.length; ++i) {
        assert(str.charCodeAt(i) === (str.charCodeAt(i) & 0xff));
        HEAP8[buffer++] = str.charCodeAt(i);
      }
      // Null-terminate the string
      HEAP8[buffer] = 0;
    };
  var _environ_get = (__environ, environ_buf) => {
      var bufSize = 0;
      getEnvStrings().forEach((string, i) => {
        var ptr = environ_buf + bufSize;
        HEAPU32[(((__environ)+(i*4))>>2)] = ptr;
        stringToAscii(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    };

  var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
      var strings = getEnvStrings();
      HEAPU32[((penviron_count)>>2)] = strings.length;
      var bufSize = 0;
      strings.forEach((string) => bufSize += string.length + 1);
      HEAPU32[((penviron_buf_size)>>2)] = bufSize;
      return 0;
    };

  function _fd_close(fd) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  }

  /** @param {number=} offset */
  var doReadv = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break; // nothing more to read
        if (typeof offset != 'undefined') {
          offset += curr;
        }
      }
      return ret;
    };
  
  function _fd_read(fd, iov, iovcnt, pnum) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doReadv(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  }

  
  var convertI32PairToI53Checked = (lo, hi) => {
      assert(lo == (lo >>> 0) || lo == (lo|0)); // lo should either be a i32 or a u32
      assert(hi === (hi|0));                    // hi should be a i32
      return ((hi + 0x200000) >>> 0 < 0x400001 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
    };
  function _fd_seek(fd,offset_low, offset_high,whence,newOffset) {
    var offset = convertI32PairToI53Checked(offset_low, offset_high);
  
    
  try {
  
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.llseek(stream, offset, whence);
      (tempI64 = [stream.position>>>0,(tempDouble = stream.position,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[((newOffset)>>2)] = tempI64[0],HEAP32[(((newOffset)+(4))>>2)] = tempI64[1]);
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  ;
  }

  /** @param {number=} offset */
  var doWritev = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) {
          // No more space to write.
          break;
        }
        if (typeof offset != 'undefined') {
          offset += curr;
        }
      }
      return ret;
    };
  
  function _fd_write(fd, iov, iovcnt, pnum) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doWritev(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  }

  FS.createPreloadedFile = FS_createPreloadedFile;
  FS.staticInit();
  // Set module methods based on EXPORTED_RUNTIME_METHODS
  ;
InternalError = Module['InternalError'] = class InternalError extends Error { constructor(message) { super(message); this.name = 'InternalError'; }};
embind_init_charCodes();
BindingError = Module['BindingError'] = class BindingError extends Error { constructor(message) { super(message); this.name = 'BindingError'; }};
init_ClassHandle();
init_RegisteredPointer();
UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');;
init_emval();;
function checkIncomingModuleAPI() {
  ignoredModuleProp('fetchSettings');
}
var wasmImports = {
  /** @export */
  __assert_fail: ___assert_fail,
  /** @export */
  __cxa_throw: ___cxa_throw,
  /** @export */
  __syscall_fcntl64: ___syscall_fcntl64,
  /** @export */
  __syscall_ioctl: ___syscall_ioctl,
  /** @export */
  __syscall_openat: ___syscall_openat,
  /** @export */
  _abort_js: __abort_js,
  /** @export */
  _embind_finalize_value_object: __embind_finalize_value_object,
  /** @export */
  _embind_register_bigint: __embind_register_bigint,
  /** @export */
  _embind_register_bool: __embind_register_bool,
  /** @export */
  _embind_register_class: __embind_register_class,
  /** @export */
  _embind_register_class_constructor: __embind_register_class_constructor,
  /** @export */
  _embind_register_class_function: __embind_register_class_function,
  /** @export */
  _embind_register_emval: __embind_register_emval,
  /** @export */
  _embind_register_float: __embind_register_float,
  /** @export */
  _embind_register_integer: __embind_register_integer,
  /** @export */
  _embind_register_memory_view: __embind_register_memory_view,
  /** @export */
  _embind_register_std_string: __embind_register_std_string,
  /** @export */
  _embind_register_std_wstring: __embind_register_std_wstring,
  /** @export */
  _embind_register_value_object: __embind_register_value_object,
  /** @export */
  _embind_register_value_object_field: __embind_register_value_object_field,
  /** @export */
  _embind_register_void: __embind_register_void,
  /** @export */
  _emscripten_memcpy_js: __emscripten_memcpy_js,
  /** @export */
  _emval_decref: __emval_decref,
  /** @export */
  _emval_take_value: __emval_take_value,
  /** @export */
  _tzset_js: __tzset_js,
  /** @export */
  emscripten_resize_heap: _emscripten_resize_heap,
  /** @export */
  environ_get: _environ_get,
  /** @export */
  environ_sizes_get: _environ_sizes_get,
  /** @export */
  fd_close: _fd_close,
  /** @export */
  fd_read: _fd_read,
  /** @export */
  fd_seek: _fd_seek,
  /** @export */
  fd_write: _fd_write
};
var wasmExports = createWasm();
var ___wasm_call_ctors = createExportWrapper('__wasm_call_ctors', 0);
var ___getTypeName = createExportWrapper('__getTypeName', 1);
var _fflush = createExportWrapper('fflush', 1);
var _malloc = createExportWrapper('malloc', 1);
var _strerror = createExportWrapper('strerror', 1);
var _free = createExportWrapper('free', 1);
var _emscripten_stack_init = () => (_emscripten_stack_init = wasmExports['emscripten_stack_init'])();
var _emscripten_stack_get_free = () => (_emscripten_stack_get_free = wasmExports['emscripten_stack_get_free'])();
var _emscripten_stack_get_base = () => (_emscripten_stack_get_base = wasmExports['emscripten_stack_get_base'])();
var _emscripten_stack_get_end = () => (_emscripten_stack_get_end = wasmExports['emscripten_stack_get_end'])();
var __emscripten_stack_restore = (a0) => (__emscripten_stack_restore = wasmExports['_emscripten_stack_restore'])(a0);
var __emscripten_stack_alloc = (a0) => (__emscripten_stack_alloc = wasmExports['_emscripten_stack_alloc'])(a0);
var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports['emscripten_stack_get_current'])();
var dynCall_jiji = Module['dynCall_jiji'] = createExportWrapper('dynCall_jiji', 5);
var dynCall_viijii = Module['dynCall_viijii'] = createExportWrapper('dynCall_viijii', 7);
var dynCall_iiiiij = Module['dynCall_iiiiij'] = createExportWrapper('dynCall_iiiiij', 7);
var dynCall_iiiiijj = Module['dynCall_iiiiijj'] = createExportWrapper('dynCall_iiiiijj', 9);
var dynCall_iiiiiijj = Module['dynCall_iiiiiijj'] = createExportWrapper('dynCall_iiiiiijj', 10);


// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

var missingLibrarySymbols = [
  'writeI53ToI64',
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53',
  'convertU32PairToI53',
  'stackAlloc',
  'getTempRet0',
  'setTempRet0',
  'exitJS',
  'growMemory',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'emscriptenLog',
  'readEmAsmArgs',
  'jstoi_q',
  'listenOnce',
  'autoResumeAudioContext',
  'handleException',
  'keepRuntimeAlive',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'asmjsMangle',
  'HandleAllocator',
  'getNativeTypeSize',
  'STACK_SIZE',
  'STACK_ALIGN',
  'POINTER_SIZE',
  'ASSERTIONS',
  'getCFunc',
  'ccall',
  'cwrap',
  'uleb128Encode',
  'sigToWasmTypes',
  'generateFuncType',
  'convertJsFunctionToWasm',
  'getEmptyTableSlot',
  'updateTableMap',
  'getFunctionAddress',
  'addFunction',
  'removeFunction',
  'reallyNegative',
  'unSign',
  'strLen',
  'reSign',
  'formatString',
  'intArrayToString',
  'AsciiToString',
  'stringToNewUTF8',
  'stringToUTF8OnStack',
  'writeArrayToMemory',
  'registerKeyEventCallback',
  'maybeCStringToJsString',
  'findEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerWheelEventCallback',
  'registerUiEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'battery',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasElementSize',
  'jsStackTrace',
  'getCallstack',
  'convertPCtoSourceLocation',
  'checkWasiClock',
  'wasiRightsToMuslOFlags',
  'wasiOFlagsToMuslOFlags',
  'safeSetTimeout',
  'setImmediateWrapped',
  'safeRequestAnimationFrame',
  'clearImmediateWrapped',
  'polyfillSetImmediate',
  'registerPostMainLoop',
  'registerPreMainLoop',
  'getPromise',
  'makePromise',
  'idsToPromises',
  'makePromiseCallback',
  'findMatchingCatch',
  'Browser_asyncPrepareDataCounter',
  'isLeapYear',
  'ydayFromDate',
  'arraySum',
  'addDays',
  'getSocketFromFD',
  'getSocketAddress',
  'FS_unlink',
  'FS_mkdirTree',
  '_setNetworkCallback',
  'heapObjectForWebGLType',
  'toTypedArrayIndex',
  'webgl_enable_ANGLE_instanced_arrays',
  'webgl_enable_OES_vertex_array_object',
  'webgl_enable_WEBGL_draw_buffers',
  'webgl_enable_WEBGL_multi_draw',
  'webgl_enable_EXT_polygon_offset_clamp',
  'webgl_enable_EXT_clip_control',
  'webgl_enable_WEBGL_polygon_mode',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'colorChannelsInGlTextureFormat',
  'emscriptenWebGLGetTexPixelData',
  'emscriptenWebGLGetUniform',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'emscriptenWebGLGetVertexAttrib',
  '__glGetActiveAttribOrUniform',
  'writeGLArray',
  'registerWebGlEventCallback',
  'runAndAbortIfError',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
  'writeStringToMemory',
  'writeAsciiToMemory',
  'setErrNo',
  'demangle',
  'stackTrace',
  'getFunctionArgsName',
  'createJsInvokerSignature',
  'registerInheritedInstance',
  'unregisterInheritedInstance',
  'getInheritedInstanceCount',
  'getLiveInheritedInstances',
  'enumReadValueFromPointer',
  'setDelayFunction',
  'validateThis',
  'getStringOrSymbol',
  'emval_get_global',
  'emval_returnValue',
  'emval_lookupTypes',
  'emval_addMethodCaller',
];
missingLibrarySymbols.forEach(missingLibrarySymbol)

var unexportedSymbols = [
  'run',
  'addOnPreRun',
  'addOnInit',
  'addOnPreMain',
  'addOnExit',
  'addOnPostRun',
  'addRunDependency',
  'removeRunDependency',
  'out',
  'err',
  'callMain',
  'abort',
  'wasmMemory',
  'wasmExports',
  'writeStackCookie',
  'checkStackCookie',
  'intArrayFromBase64',
  'tryParseAsDataURI',
  'convertI32PairToI53Checked',
  'stackSave',
  'stackRestore',
  'ptrToString',
  'zeroMemory',
  'getHeapMax',
  'abortOnCannotGrowMemory',
  'ENV',
  'ERRNO_CODES',
  'strError',
  'DNS',
  'Protocols',
  'Sockets',
  'timers',
  'warnOnce',
  'readEmAsmArgsArray',
  'jstoi_s',
  'getExecutableName',
  'dynCallLegacy',
  'getDynCaller',
  'dynCall',
  'asyncLoad',
  'alignMemory',
  'mmapAlloc',
  'wasmTable',
  'noExitRuntime',
  'freeTableIndexes',
  'functionsInTableMap',
  'setValue',
  'getValue',
  'PATH',
  'PATH_FS',
  'UTF8Decoder',
  'UTF8ArrayToString',
  'UTF8ToString',
  'stringToUTF8Array',
  'stringToUTF8',
  'lengthBytesUTF8',
  'intArrayFromString',
  'stringToAscii',
  'UTF16Decoder',
  'UTF16ToString',
  'stringToUTF16',
  'lengthBytesUTF16',
  'UTF32ToString',
  'stringToUTF32',
  'lengthBytesUTF32',
  'JSEvents',
  'specialHTMLTargets',
  'findCanvasEventTarget',
  'currentFullscreenStrategy',
  'restoreOldWindowedStyle',
  'UNWIND_CACHE',
  'ExitStatus',
  'getEnvStrings',
  'doReadv',
  'doWritev',
  'initRandomFill',
  'randomFill',
  'promiseMap',
  'uncaughtExceptionCount',
  'exceptionLast',
  'exceptionCaught',
  'ExceptionInfo',
  'Browser',
  'getPreloadedImageData__data',
  'wget',
  'MONTH_DAYS_REGULAR',
  'MONTH_DAYS_LEAP',
  'MONTH_DAYS_REGULAR_CUMULATIVE',
  'MONTH_DAYS_LEAP_CUMULATIVE',
  'SYSCALLS',
  'preloadPlugins',
  'FS_createPreloadedFile',
  'FS_modeStringToFlags',
  'FS_getMode',
  'FS_stdin_getChar_buffer',
  'FS_stdin_getChar',
  'FS_createPath',
  'FS_createDevice',
  'FS_readFile',
  'FS',
  'FS_createDataFile',
  'FS_createLazyFile',
  'MEMFS',
  'TTY',
  'PIPEFS',
  'SOCKFS',
  'tempFixedLengthArray',
  'miniTempWebGLFloatBuffers',
  'miniTempWebGLIntBuffers',
  'GL',
  'AL',
  'GLUT',
  'EGL',
  'GLEW',
  'IDBStore',
  'SDL',
  'SDL_gfx',
  'allocateUTF8',
  'allocateUTF8OnStack',
  'print',
  'printErr',
  'InternalError',
  'BindingError',
  'throwInternalError',
  'throwBindingError',
  'registeredTypes',
  'awaitingDependencies',
  'typeDependencies',
  'tupleRegistrations',
  'structRegistrations',
  'sharedRegisterType',
  'whenDependentTypesAreResolved',
  'embind_charCodes',
  'embind_init_charCodes',
  'readLatin1String',
  'getTypeName',
  'getFunctionName',
  'heap32VectorToArray',
  'requireRegisteredType',
  'usesDestructorStack',
  'checkArgCount',
  'getRequiredArgCount',
  'createJsInvoker',
  'UnboundTypeError',
  'PureVirtualError',
  'GenericWireTypeSize',
  'EmValType',
  'EmValOptionalType',
  'throwUnboundTypeError',
  'ensureOverloadTable',
  'exposePublicSymbol',
  'replacePublicSymbol',
  'extendError',
  'createNamedFunction',
  'embindRepr',
  'registeredInstances',
  'getBasestPointer',
  'getInheritedInstance',
  'registeredPointers',
  'registerType',
  'integerReadValueFromPointer',
  'floatReadValueFromPointer',
  'readPointer',
  'runDestructors',
  'newFunc',
  'craftInvokerFunction',
  'embind__requireFunction',
  'genericPointerToWireType',
  'constNoSmartPtrRawPointerToWireType',
  'nonConstNoSmartPtrRawPointerToWireType',
  'init_RegisteredPointer',
  'RegisteredPointer',
  'RegisteredPointer_fromWireType',
  'runDestructor',
  'releaseClassHandle',
  'finalizationRegistry',
  'detachFinalizer_deps',
  'detachFinalizer',
  'attachFinalizer',
  'makeClassHandle',
  'init_ClassHandle',
  'ClassHandle',
  'throwInstanceAlreadyDeleted',
  'deletionQueue',
  'flushPendingDeletes',
  'delayFunction',
  'RegisteredClass',
  'shallowCopyInternalPointer',
  'downcastPointer',
  'upcastPointer',
  'char_0',
  'char_9',
  'makeLegalFunctionName',
  'emval_freelist',
  'emval_handles',
  'emval_symbols',
  'init_emval',
  'count_emval_handles',
  'Emval',
  'emval_methodCallers',
  'reflectConstruct',
];
unexportedSymbols.forEach(unexportedRuntimeSymbol);



var calledRun;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  _emscripten_stack_init();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}

function run() {

  if (runDependencies > 0) {
    return;
  }

  stackCheckInit();

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    readyPromiseResolve(Module);
    Module['onRuntimeInitialized']?.();

    assert(!Module['_main'], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(() => {
      setTimeout(() => Module['setStatus'](''), 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
  checkStackCookie();
}

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = (x) => {
    has = true;
  }
  try { // it doesn't matter if it fails
    _fflush(0);
    // also flush in the JS FS layer
    ['stdout', 'stderr'].forEach((name) => {
      var info = FS.analyzePath('/dev/' + name);
      if (!info) return;
      var stream = info.object;
      var rdev = stream.rdev;
      var tty = TTY.ttys[rdev];
      if (tty?.output?.length) {
        has = true;
      }
    });
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.');
  }
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

run();

// end include: postamble.js

// include: postamble_modularize.js
// In MODULARIZE mode we wrap the generated code in a factory function
// and return either the Module itself, or a promise of the module.
//
// We assign to the `moduleRtn` global here and configure closure to see
// this as and extern so it won't get minified.

moduleRtn = readyPromise;

// Assertion for attempting to access module properties on the incoming
// moduleArg.  In the past we used this object as the prototype of the module
// and assigned properties to it, but now we return a distinct object.  This
// keeps the instance private until it is ready (i.e the promise has been
// resolved).
for (const prop of Object.keys(Module)) {
  if (!(prop in moduleArg)) {
    Object.defineProperty(moduleArg, prop, {
      configurable: true,
      get() {
        abort(`Access to module property ('${prop}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`)
      }
    });
  }
}
// end include: postamble_modularize.js



  return moduleRtn;
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = SPLDecoder;
else if (typeof define === 'function' && define['amd'])
  define([], () => SPLDecoder);
