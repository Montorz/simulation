export default function ControlsPanel({ params, onParamsChange, onReset, showVision, setShowVision }) {
  return (
    <div className="controls">
      <h3>Параметры симуляции</h3>
      
      <div className="control-group">
        <label>
          Хищники: {params.predatorCount}
          <input
            type="range"
            min="1"
            max="20"
            value={params.predatorCount}
            onChange={(e) => onParamsChange({ ...params, predatorCount: +e.target.value })}
          />
        </label>

        <label>
          Скорость хищников: {params.predatorSpeed.toFixed(1)}
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={params.predatorSpeed}
            onChange={(e) => onParamsChange({ ...params, predatorSpeed: +e.target.value })}
          />
        </label>

        <label>
          Радиус охоты: {params.predatorVisionRadius}
          <input
            type="range"
            min="50"
            max="250"
            value={params.predatorVisionRadius}
            onChange={(e) => onParamsChange({ ...params, predatorVisionRadius: +e.target.value })}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Жертвы: {params.preyCount}
          <input
            type="range"
            min="1"
            max="50"
            value={params.preyCount}
            onChange={(e) => onParamsChange({ ...params, preyCount: +e.target.value })}
          />
        </label>

        <label>
          Скорость жертв: {params.preySpeed.toFixed(1)}
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={params.preySpeed}
            onChange={(e) => onParamsChange({ ...params, preySpeed: +e.target.value })}
          />
        </label>

        <label>
          Радиус зрения: {params.preyVisionRadius}
          <input
            type="range"
            min="50"
            max="250"
            value={params.preyVisionRadius}
            onChange={(e) => onParamsChange({ ...params, preyVisionRadius: +e.target.value })}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Трава: {params.foodCount}
          <input
            type="range"
            min="10"
            max="300"
            value={params.foodCount}
            onChange={(e) => onParamsChange({ ...params, foodCount: +e.target.value })}
          />
        </label>

        <label className="toggle-vision">
          Показать радиусы:
          <input
            type="checkbox"
            checked={showVision}
            onChange={() => setShowVision(!showVision)}
          />
        </label>
      </div>

      <button onClick={onReset}>Сбросить симуляцию</button>
    </div>
  );
}