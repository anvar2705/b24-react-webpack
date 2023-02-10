import React, { useState } from 'react';

import s from './App.module.css';

const App = () => {
  const [count, setCount] = useState(0);
  return (
    <div className={s.root}>
      Count: {count}
      <button type="button" onClick={() => setCount(count + 1)}>
        click
      </button>
    </div>
  );
};

export default App;
