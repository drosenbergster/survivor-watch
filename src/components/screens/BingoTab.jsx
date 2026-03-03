import { FijianCard, FijianSectionHeader, Icon } from '../fijian';

export default function BingoTab() {
    return (
        <div className="space-y-6">
            <header className="text-center">
                <h2 className="font-display text-4xl tracking-wider text-sand-warm drop-shadow-text">Qito</h2>
                <p className="text-sand-warm/70 text-sm mt-1 font-sans">Bingo</p>
            </header>
            <FijianCard className="p-8 max-w-md mx-auto text-center">
                <FijianSectionHeader title="Coming Soon" className="justify-center" />
                <div className="flex justify-center mb-4 opacity-30">
                    <Icon name="grid_view" className="text-ochre text-4xl" />
                </div>
                <p className="text-earth font-serif italic text-sm leading-relaxed">
                    Bingo cards will be generated once episodes begin. Get ready for BULA!
                </p>
            </FijianCard>
        </div>
    );
}
