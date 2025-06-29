export default function ControlsPanel({
  params,
  onParamsChange,
  onReset,
  showVision,
  setShowVision,
  stats
}) {
  return (
    <div className="controls">
      <div className="stats">
        <h3>Статистика</h3>
        <p>Хищников: <span>{stats.predators}</span></p>
        <p>Жертв: <span>{stats.prey}</span></p>
        <p>Травы: <span>{stats.food}/{params.foodCount}</span></p>
        <p>Ядовитых жертв: <span>{stats.poisoned}</span></p>
      </div>

      <div className="control-group">
        <h3>Управление</h3>
        <button onClick={onReset}>Сбросить</button>
        <label className="toggle-vision">
          <input
            type="checkbox"
            checked={showVision}
            onChange={() => setShowVision(!showVision)}
          />
          Радиус зрения
        </label>
      </div>

      <div className="control-group">
        <h3>Хищники</h3>
        <label>
          Количество: {params.predatorCount}
          <input
            type="range"
            min="1"
            max="20"
            value={params.predatorCount}
            onChange={(e) => onParamsChange({ ...params, predatorCount: +e.target.value })}
          />
        </label>
        <label>
          Скорость: {params.predatorSpeed.toFixed(1)}
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={params.predatorSpeed}
            onChange={(e) => onParamsChange({ ...params, predatorSpeed: +e.target.value })}
          />
        </label>
        <label>
          Радиус зрения: {params.predatorVisionRadius}
          <input
            type="range"
            min="50"
            max="300"
            value={params.predatorVisionRadius}
            onChange={(e) => onParamsChange({ ...params, predatorVisionRadius: +e.target.value })}
          />
        </label>
        <label>
          Для размножения: {params.predatorReproductionThreshold}
          <input
            type="range"
            min="1"
            max="5"
            value={params.predatorReproductionThreshold}
            onChange={(e) => onParamsChange({ ...params, predatorReproductionThreshold: +e.target.value })}
          />
        </label>
      </div>

      <div className="control-group">
        <h3>Жертвы</h3>
        <label>
          Количество: {params.preyCount}
          <input
            type="range"
            min="10"
            max="100"
            value={params.preyCount}
            onChange={(e) => onParamsChange({ ...params, preyCount: +e.target.value })}
          />
        </label>
        <label>
          Скорость: {params.preySpeed.toFixed(1)}
          <input
            type="range"
            min="0.5"
            max="2.5"
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
            max="300"
            value={params.preyVisionRadius}
            onChange={(e) => onParamsChange({ ...params, preyVisionRadius: +e.target.value })}
          />
        </label>
        <label>
          Для размножения: {params.preyReproductionThreshold}
          <input
            type="range"
            min="1"
            max="8"
            value={params.preyReproductionThreshold}
            onChange={(e) => onParamsChange({ ...params, preyReproductionThreshold: +e.target.value })}
          />
        </label>
      </div>

      <div className="control-group">
        <h3>Окружение</h3>
        <label>
          Трава: {params.foodCount}
          <input
            type="range"
            min="50"
            max="300"
            value={params.foodCount}
            onChange={(e) => onParamsChange({ ...params, foodCount: +e.target.value })}
          />
        </label>
        <label>
          Шанс яда: {(params.poisonChance * 100).toFixed(0)}%
          <input
            type="range"
            min="0"
            max="5"
            value={params.poisonChance * 100}
            onChange={(e) => onParamsChange({ ...params, poisonChance: +e.target.value / 100 })}
          />
        </label>
        <label>
          Восстановление: {params.recoveryTimeSeconds} сек
          <input
            type="range"
            min="5"
            max="60"
            value={params.recoveryTimeSeconds}
            onChange={(e) => onParamsChange({ ...params, recoveryTimeSeconds: +e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}