import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Music } from "lucide-react";
import { soundManager } from "@/utils/sounds";
import { musicManager } from "@/utils/backgroundMusic";
import { useState } from "react";

interface SettingsProps {
  onClose?: () => void;
}

export const Settings = ({ onClose }: SettingsProps) => {
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());
  const [musicEnabled, setMusicEnabled] = useState(musicManager.isEnabled());
  const [musicVolume, setMusicVolume] = useState([20]);

  const toggleSound = () => {
    const newState = soundManager.toggle();
    setSoundEnabled(newState);
  };

  const toggleMusic = () => {
    const newState = musicManager.toggle();
    setMusicEnabled(newState);
  };

  const handleVolumeChange = (value: number[]) => {
    setMusicVolume(value);
    musicManager.setVolume(value[0] / 100);
  };

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Customize your game experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              <Label htmlFor="sound-effects">Sound Effects</Label>
            </div>
            <Switch
              id="sound-effects"
              checked={soundEnabled}
              onCheckedChange={toggleSound}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              <Label htmlFor="background-music">Background Music</Label>
            </div>
            <Switch
              id="background-music"
              checked={musicEnabled}
              onCheckedChange={toggleMusic}
            />
          </div>

          {musicEnabled && (
            <div className="space-y-2">
              <Label>Music Volume</Label>
              <Slider
                value={musicVolume}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground text-right">{musicVolume[0]}%</p>
            </div>
          )}
        </div>

        {onClose && (
          <Button onClick={onClose} className="w-full game-button">
            Close
          </Button>
        )}
      </CardContent>
    </Card>
  );
};