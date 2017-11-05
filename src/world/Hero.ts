
import {Street} from "./Street";
import {Cop} from "./Cop";
import {Civil} from "./Civil";
import {Gun} from "./Weapon/Gun";

export class Hero extends Phaser.Sprite
{
    public body: Phaser.Physics.Arcade.Body;
    private speed: number = 150;
    private scaleRatio = 2;
    private gun: Gun;
    private cursors: Phaser.CursorKeys;
    private spaceKey: Phaser.Key;
    private street: Street;

    constructor(group: Phaser.Group, x: number, y: number, key: string, street: Street)
    {
        super(group.game, x, y, key, 0);

        this.street = street;

        group.game.physics.enable(this, Phaser.Physics.ARCADE);
        group.add(this);

        this.scale.setTo(this.scaleRatio, this.scaleRatio);
        this.anchor.setTo(0.5, 0.5);
        this.body.setCircle(9, 7, 8);
        this.body.allowGravity = false;
        this.body.collideWorldBounds = true;

        this.animations.add('idle', [0, 1, 2, 3, 4], 4, true);
        this.animations.add('walk', [5, 6, 7, 8, 9, 10, 11, 12, 13], 12, true);
        this.animations.add('die', [14, 15, 16, 17, 18, 19, 20], 12, false);
        this.animations.add('shot', [21, 22, 23, 24, 25, 26], 12, false);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.gun = new Gun(group, this);
    }

    public update()
    {
        this.move();

        this.gun.bulletHits(
            this.street.cops().allAlive(),
            function(cop: Cop, bullet: Phaser.Bullet) {
                bullet.kill();
                cop.health = 0;
            }
        );

        this.gun.bulletHits(
            this.street.civils().allAlive(),
            function(civil: Civil, bullet: Phaser.Bullet) {
                bullet.kill();
                civil.health = 0;
            }
        );
    }

    private move()
    {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        if (this.cursors.left.isDown) {
            this.scale.x = -this.scaleRatio;
            this.body.velocity.x = -this.speed;
            this.animations.play('walk');
            this.gun.turnToTheLeft();

        } else if (this.cursors.right.isDown) {
            this.scale.x = this.scaleRatio;
            this.body.velocity.x = this.speed;
            this.animations.play('walk');
            this.gun.turnToTheRight();

        } else if (this.cursors.up.isDown && (this.street.minY() + 10) <= this.position.y ) {
            this.body.velocity.y = -this.speed;
            this.animations.play('walk');

        } else if (this.cursors.down.isDown) {
            this.body.velocity.y = this.speed;
            this.animations.play('walk');

        } else if (this.spaceKey.isDown) {
            this.animations.play('shot');
            this.gun.fire();

        } else {
            this.animations.play('idle');
        }
    }

    movingToTheRight(): boolean
    {
        return this.body.velocity.x > 0;
    }

    movingToTheLeft(): boolean
    {
        return this.body.velocity.x < 0;
    }
}
