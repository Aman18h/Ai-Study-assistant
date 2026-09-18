function MainLayout({ leftSidebar, chatSidebar, children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--paper)]">
      {leftSidebar}
      {chatSidebar}
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

export default MainLayout;