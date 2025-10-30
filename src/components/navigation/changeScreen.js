export const changeScreen = (screen, setScreen) => {
  screen === 'grid' ? setScreen('list') : setScreen('grid');
};

export const changeType = (screen, setScreen) =>{
  screen === 'Surveillance'? setScreen('Solar') : setScreen('Surveillance');
}
