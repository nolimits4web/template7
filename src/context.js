let t7ctx;
if (typeof window !== 'undefined') {
  t7ctx = window;
} else if (typeof global !== 'undefined') {
  t7ctx = global;
} else {
  t7ctx = this;
}

const Template7Context = t7ctx;

export default Template7Context;
