<template>
    <canvas ref="canvas"></canvas>
</template>

<script>
export default {
    props: [ "state" ],
    data() {
        return {
            ctx: null
        };
    },
    mounted() {
        let canvas = this.$refs.canvas;
        canvas.width = 600;
        canvas.height = 400;
        this.ctx = canvas.getContext("2d");

        this.draw();
    },
    watch: {
        state() { this.draw(); }
    },
    methods: {
        _height(x) { return Math.sin(3*x) * .45 + .55; },
        draw() {
            let ctx = this.ctx;

            ctx.save();
            ctx.scale(1, -1);
            ctx.translate(0, -400);
            ctx.clearRect(0, 0, 600, 400);
            ctx.fillRect(...this.state, 10, 10);


            let min_position = -1.2
            let max_position = 0.6
            let goal_position = 0.5
            let world_width = max_position - min_position;
            let scale = 600 / world_width;

            let carDim = [ 40, 20 ];

            let xstep = world_width / 100;
            ctx.beginPath();
            ctx.moveTo(0, scale*this._height(min_position));
            for (let i = 1; i < 100; ++i) {
                let x = min_position + xstep*i;
                ctx.lineTo(scale*i*xstep, scale*this._height(x));
            }

            ctx.lineWidth = 4;
            ctx.stroke();

            let flagx = scale*(goal_position - min_position);
            let flagbottom = scale*this._height(goal_position);
            let flagtop = flagbottom + 50;
            ctx.beginPath();
            ctx.moveTo(flagx, flagbottom);
            ctx.lineTo(flagx, flagtop);
            ctx.stroke();

            let cartX = this.state[0] - min_position;
            ctx.fillRect(scale*cartX, scale*this._height(this.state[0]), 10, 10);

            ctx.restore();

        }
    }
}
</script>