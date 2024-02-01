import React from 'react';
import Body from './Body';
import Header from './Header';
import SideMenu from './SideMenu';

function Layout({ menu, body }) {
  const [open, setOpen] = React.useState(false);
  function handleMenuToggle() {
    setOpen(open => !!!open);
  }
  return (
      <div style={{ display: 'flex' }}>
        <Header handleMenuToggle={handleMenuToggle}/>
        <SideMenu open={open} setOpen={setOpen}>{menu}</SideMenu>
        <Body>{body}</Body>
      </div>
  );
}

export default Layout;
