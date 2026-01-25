function updateActionButtons(gameState) {
    if (!gameState) return;

    // ✅ Backend-dən gələn məlumatlardan buttons hesabla
    const isTurn = (gameState.currentTurnUserId === currentUserId);
    const canFold = isTurn;
    const canRaise = isTurn && (gameState.canCall || gameState.currentBet === 0);
    const canAllIn = isTurn && myBalance < gameState.currentBet;

    console.log('🎬 updateActionButtons:', {
        isTurn: isTurn,
        canFold: canFold,
        canCall: gameState.canCall,
        canRaise: canRaise,
        canShowdownCall: gameState.canShowdownCall,
        canAllIn: canAllIn
    });

    // ============ FOLD ============
    const foldBtn = document.getElementById('foldBtn');
    if (foldBtn) {
        foldBtn.disabled = !canFold;
        foldBtn.style.opacity = canFold ? '1' : '0.5';
    }

    // ============ CALL ============
    const callBtn = document.getElementById('callBtn');
    if (callBtn) {
        callBtn.disabled = !gameState.canCall;
        callBtn.style.opacity = gameState.canCall ? '1' : '0.5';
        if (gameState.canCall && gameState.callAmount > 0) {
            callBtn.innerHTML = `CALL(${ gameState.callAmount.toFixed(2) }₼)`;
        } else {
            callBtn.innerHTML = `Call(${ gameState.entryFee.toFixed(2) }₼)`;
        }
    }

    // ============ RAISE ============
    const raiseBtn = document.getElementById('raiseBtn');
    const raiseSlider = document.getElementById('raiseSlider');
    if (raiseBtn && raiseSlider) {
        raiseBtn.disabled = !canRaise;
        raiseBtn.style.opacity = canRaise ? '1' : '0.5';
        raiseSlider.disabled = !canRaise;

        if (gameState.minRaise !== undefined && gameState.maxRaise !== undefined) {
            const minVal = parseFloat(gameState.minRaise.toFixed(2));
            const maxVal = parseFloat(gameState.maxRaise.toFixed(2));
            raiseSlider.min = minVal;
            raiseSlider.max = maxVal;
            raiseSlider.value = minVal;
            document.getElementById('sliderMin').textContent = `Min: ${ minVal.toFixed(2) }₼`;
            document.getElementById('sliderMax').textContent = `Max: ${ maxVal.toFixed(2) }₼`;
            document.getElementById('raiseValue').textContent = `${ minVal.toFixed(2) } ₼`;
        }
    }

    // ============ ALL-IN ============
    const allInBtn = document.getElementById('allInBtn');
    if (allInBtn) {
        allInBtn.disabled = !canAllIn;
        allInBtn.style.opacity = canAllIn ? '1' : '0.5';
    }

    // ============ SHOWDOWN CALL ============

    const showdownCallBtn = document.getElementById('showdownCallBtn');
    if (showdownCallBtn) {
        // ✅ currentBet = 0 olarsa və ya canShowdownCall false olarsa disabled
        const isShowdownDisabled = gameState.currentBet === 0 || !gameState.canShowdownCall;

        showdownCallBtn.disabled = isShowdownDisabled;
        showdownCallBtn.style.opacity = !isShowdownDisabled ? '1' : '0.5';

        if (!isShowdownDisabled) {
            showdownCallBtn.classList.add('golden-glow');
        } else {
            showdownCallBtn.classList.remove('golden-glow');
        }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Buttons updated');
    console.log(`🔴 FOLD: ${ canFold? '✅': '❌' }`);
    console.log(`📞 CALL: ${ gameState.canCall ? '✅' : '❌' }`);
    console.log(`📈 RAISE: ${ canRaise? '✅': '❌' }`);
    console.log(`🔥 ALL - IN: ${ canAllIn? '✅': '❌' }`);
    console.log(`⭐ SHOWDOWN: ${ gameState.canShowdownCall ? '✅' : '❌' }`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}