class Particle {
    // Particleの位置とサイズを初期化
    constructor(_position, _size) {
        this.position = _position;
        this.basePos = _position;
        this.size = _size;
    }
    
    // Particleを描画する
    display() {
        ellipse(this.position.x, this.position.y, this.size);
    }

    // Particleの位置を返す
    getPosition() {
        return this.position;
    }
}

// 一つの円に対するParticleの数
var PARTICLE_NUM = 18;
let speed = 2;
class ParticleManager {
    // CircularParticleの位置と彩度を初期化
    constructor(_position, _hue, _size) {
        this.position = _position;
        this.hue = _hue;
        this.particles = [];
        this.velocity = createVector(random(-speed, speed), random(-speed, speed));
        var angle = 0;
        var angleStep = 2 * PI / PARTICLE_NUM;
        this.width = _size || random(50, 150);
        for (var i = 0; i < PARTICLE_NUM; i++) {
            var particlePos = createVector(cos(angle) * this.width, sin(angle) * this.width);
            this.particles[i] = new Particle(particlePos, 10, radians(angle));
            angle += angleStep;
        }
    }
    
    update() {
        this.position.add(this.velocity);
        if (this.position.x < this.width || this.position.x > width - this.width) {
            this.velocity.x *= -1;
        }
        if (this.position.y < this.width || this.position.y > height - this.width) {
            this.velocity.y *= -1;
        }
    }
    
    connectMyGroup() {
        for (var i = 0; i < this.particles.length; i++) {
            var startPos = this.particles[i].getPosition();
            var index = i + 1;
            if (index == this.particles.length) {
                index = 0;
            }
            var endPos = this.particles[index].getPosition();
            line(startPos.x, startPos.y, endPos.x, endPos.y);
        }
    }

    // CircularParticleを描画する
    display() {
        this.update();
        this.connectMyGroup();
        push();
        translate(this.position.x, this.position.y);
        fill(this.hue, 255, 255);
        for (var i = 0; i < PARTICLE_NUM; i++) {
            this.particles[i].display();
        }
        pop();
    }

    getParticles() {
        return this.particles;
    }
    
    getBasePoint() {
        return this.position;
    }
}

class NodeManager {
    constructor(_particleManagers) {
        this.particleManagers = _particleManagers;
        this.particles = [];
        for (var i = 0; i < this.particleManagers.length; i++) {
            this.particles[i] = this.particleManagers[i].getParticles();
        }
    }
    
    update() {
        let mainParticleManagerIndex = this.particleManagers.length - 1;
        for (var i = 0; i < this.particleManagers.length - 1; i++) {
            if (p5.Vector.dist(this.particleManagers[i].getBasePoint(), this.particleManagers[mainParticleManagerIndex].getBasePoint()) < 50) {
                this.particleManagers[mainParticleManagerIndex].growUp(1.1);
                this.particleManagers.splice(i, 1);
                this.particles.splice(i, 1);
                break;
            }
        }
    }

    display() {
        this.update();
        for (var i = 0; i < this.particleManagers.length; i++) {
            this.particleManagers[i].display();
            push();
            stroke(this.particleManagers[i].hue, 255, 255);
            strokeWeight(0.5);
            for (var j = 0; j < PARTICLE_NUM; j++) {
                var startPos = p5.Vector.add(this.particles[i][j].getPosition(), this.particleManagers[i].getBasePoint());
                var index = i + 1;
                if (index == this.particleManagers.length) {
                    index = 0;
                }
                var endPos = p5.Vector.add(this.particles[index][j].getPosition(), this.particleManagers[index].getBasePoint());
                line(startPos.x, startPos.y, endPos.x, endPos.y);
            }
            pop();
        }
    }
}

// MainParticleManagerは常にリストの最後に入る
class MainParticleManager extends ParticleManager {
    constructor(_position, _hue) {
        super(_position, _hue, random(10, 30));
    }

    display() {
        this.update();
        this.connectMyGroup();
        push();
        translate(this.position.x, this.position.y);
        fill(255, 0, 255);
        for (var i = 0; i < PARTICLE_NUM; i++) {
            this.particles[i].display();
        }
        pop();
    }
    
    growUp(_size) {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].getPosition().mult(_size);
        }
    }
}

/*
* 以下メインプログラム
*
*/
var particleManager = [];
var nodeManager;
var NUM_OF_NODE = 30;
function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 255);
    particleManager[0] = new ParticleManager(createVector(width / 2, height / 2), 0);
    particleManager[1] = new ParticleManager(createVector(200, 200), 50);
    for (var i = 0; i < NUM_OF_NODE; i++) {
        particleManager[i] = new ParticleManager(createVector(random(150, width - 150), random(150, height - 150)), random(255));
    }
    particleManager.push(new MainParticleManager(createVector(random(150, width - 150), random(150, height - 150)), 255));
    nodeManager = new NodeManager(particleManager);
}

function draw() {
    blendMode(BLEND);
    background(0, 30);
    blendMode(ADD);
    nodeManager.display();
}