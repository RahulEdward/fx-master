import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useTerminalStore } from '../../hooks/useTerminalStore';
import { PanelWrapper } from './PanelWrapper';
import { DEFAULT_LAYOUT } from '../../lib/constants';

// Panel imports
import { WatchlistPanel } from '../panels/WatchlistPanel';
import { ChartPanel } from '../panels/ChartPanel';
import { OrderTicketPanel } from '../panels/OrderTicketPanel';
import { PositionsPanel } from '../panels/PositionsPanel';
import { FundsPanel } from '../panels/FundsPanel';
import { TradeBookPanel } from '../panels/TradeBookPanel';
import { AlertsPanel } from '../panels/AlertsPanel';
import { MarketDepthPanel } from '../panels/MarketDepthPanel';

const ResponsiveGridLayout = WidthProvider(Responsive);

const PANEL_COMPONENTS = {
  watchlist: WatchlistPanel,
  chart: ChartPanel,
  orderTicket: OrderTicketPanel,
  positions: PositionsPanel,
  funds: FundsPanel,
  tradebook: TradeBookPanel,
  alerts: AlertsPanel,
  marketDepth: MarketDepthPanel,
};

export function GridLayout() {
  const {
    panels, isEditMode,
    savedLayouts, activeLayoutName,
    pendingLayouts, updatePendingLayout,
    isAutosaveEnabled, saveLayout,
    maximizedPanelId, setMaximizedPanel,
    togglePanel, minimizePanel,
  } = useTerminalStore();

  const layouts = useMemo(() => {
    if (maximizedPanelId) {
      return { lg: [{ i: maximizedPanelId, x: 0, y: 0, w: 24, h: 22 }] };
    }

    const currentBase = (isEditMode && !isAutosaveEnabled && pendingLayouts)
      ? pendingLayouts.lg
      : (savedLayouts[activeLayoutName]?.lg || []);

    const visiblePanels = panels.filter(p => p.visible);

    const lg = visiblePanels.map(p => {
      let item = currentBase.find(l => l.i === p.id);
      if (!item) item = DEFAULT_LAYOUT.find(l => l.i === p.id);
      if (!item) item = { i: p.id, x: 0, y: 100, w: 6, h: 6, minW: 3, minH: 3 };
      if (p.minimized) return { ...item, h: 1 };
      return item;
    });

    return { lg };
  }, [isEditMode, isAutosaveEnabled, pendingLayouts, savedLayouts, activeLayoutName, panels, maximizedPanelId]);

  const handleLayoutChange = useCallback((_layout, allLayouts) => {
    const sanitizedLg = (allLayouts.lg || []).map(item => {
      const p = panels.find(panel => panel.id === item.i);
      if (p?.minimized) {
        const currentLayout = (isEditMode && !isAutosaveEnabled && pendingLayouts)
          ? pendingLayouts.lg
          : (savedLayouts[activeLayoutName]?.lg || []);
        const originalItem = currentLayout.find(l => l.i === item.i);
        return { ...item, h: originalItem?.h || item.h };
      }
      return item;
    });

    const sanitized = { ...allLayouts, lg: sanitizedLg };
    if (isAutosaveEnabled) {
      saveLayout(activeLayoutName, sanitized);
    } else {
      updatePendingLayout(sanitized);
    }
  }, [isEditMode, isAutosaveEnabled, activeLayoutName, saveLayout, updatePendingLayout, panels, pendingLayouts, savedLayouts]);

  // Auto-scroll to newly visible panels
  const prevVisibleCount = useRef(panels.filter(p => p.visible).length);
  useEffect(() => {
    const visibleCount = panels.filter(p => p.visible).length;
    if (visibleCount > prevVisibleCount.current) {
      // A new panel was added — scroll to bottom after layout settles
      setTimeout(() => {
        const container = document.querySelector('.layout')?.parentElement;
        if (container) container.scrollTop = container.scrollHeight;
      }, 100);
    }
    prevVisibleCount.current = visibleCount;
  }, [panels]);

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
      rowHeight={30}
      autoSize={true}
      draggableHandle=".panel-drag-handle"
      isDraggable={!maximizedPanelId}
      isResizable={!maximizedPanelId}
      resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
      onLayoutChange={handleLayoutChange}
      margin={[4, 4]}
      containerPadding={[4, 4]}
      compactType="vertical"
    >
      {panels
        .filter(p => p.visible && (!maximizedPanelId || p.id === maximizedPanelId))
        .map(panel => {
          const Component = PANEL_COMPONENTS[panel.id];
          if (!Component) return null;
          const isMaximized = maximizedPanelId === panel.id;
          return (
            <div key={panel.id}>
              <PanelWrapper
                title={panel.title}
                minimized={panel.minimized}
                maximized={isMaximized}
                onMinimize={() => minimizePanel(panel.id)}
                onMaximize={() => setMaximizedPanel(isMaximized ? null : panel.id)}
                onClose={() => togglePanel(panel.id)}
                draggable={!isMaximized}
              >
                {!panel.minimized && <Component />}
              </PanelWrapper>
            </div>
          );
        })}
    </ResponsiveGridLayout>
  );
}
