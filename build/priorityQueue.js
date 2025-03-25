"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityQueue = void 0;
/**
 * 이진 힙 기반의 우선순위 큐 구현
 *
 * 시간 복잡도:
 * - enqueue: O(log n)
 * - dequeue: O(log n)
 * - peek: O(1)
 */
var PriorityQueue = /** @class */ (function () {
    /**
     * 우선순위 큐 생성자
     * @param compareFn 선택적 비교 함수. 기본값은 숫자 우선순위 비교 (작은 값이 높은 우선순위)
     */
    function PriorityQueue(compareFn) {
        if (compareFn === void 0) { compareFn = function (a, b) { return a - b; }; }
        this.compareFn = compareFn;
        this.heap = []; // [요소, 우선순위, 삽입순서]
        this.sequence = 0; // 삽입 순서 추적을 위한 시퀀스 번호
    }
    /**
     * 요소를 우선순위 큐에 추가
     * @param element 추가할 요소
     * @param priority 요소의 우선순위 값
     * @returns 큐의 크기
     */
    PriorityQueue.prototype.enqueue = function (element, priority) {
        var seq = this.sequence++;
        this.heap.push([element, priority, seq]);
        return this.siftUp(this.heap.length - 1);
    };
    /**
     * 가장 높은 우선순위 요소를 제거하고 반환
     * @returns 가장 높은 우선순위 요소 또는 큐가 비어있을 경우 null
     */
    PriorityQueue.prototype.dequeue = function () {
        if (this.isEmpty())
            return null;
        var top = this.heap[0];
        var bottom = this.heap.pop();
        if (this.heap.length > 0 && bottom) {
            this.heap[0] = bottom;
            this.siftDown(0);
        }
        return top[0];
    };
    /**
     * 가장 높은 우선순위 요소를 제거하지 않고 반환
     * @returns 가장 높은 우선순위 요소 또는 큐가 비어있을 경우 null
     */
    PriorityQueue.prototype.peek = function () {
        return this.isEmpty() ? null : this.heap[0][0];
    };
    /**
     * 큐가 비어있는지 확인
     * @returns 큐가 비어있으면 true, 그렇지 않으면 false
     */
    PriorityQueue.prototype.isEmpty = function () {
        return this.heap.length === 0;
    };
    /**
     * 큐의 크기 반환
     * @returns 큐에 있는 요소의 수
     */
    PriorityQueue.prototype.size = function () {
        return this.heap.length;
    };
    /**
     * 큐의 모든 요소 삭제
     */
    PriorityQueue.prototype.clear = function () {
        this.heap = [];
        this.sequence = 0;
    };
    /**
     * 큐의 요소들을 배열로 변환 (우선순위 순서대로)
     * @returns 우선순위 순서대로 정렬된 요소 배열
     */
    PriorityQueue.prototype.toArray = function () {
        // 힙을 복사하여 정렬
        var sortedHeap = __spreadArray([], this.heap, true);
        var result = [];
        var tempQueue = new PriorityQueue(this.compareFn);
        tempQueue.heap = sortedHeap;
        while (!tempQueue.isEmpty()) {
            var element = tempQueue.dequeue();
            if (element) {
                result.push(element);
            }
        }
        return result;
    };
    /**
     * 요소의 위치를 상향 조정 (힙 속성 유지)
     * @param index 상향 조정할 요소의 인덱스
     * @returns 큐의 크기
     */
    PriorityQueue.prototype.siftUp = function (index) {
        var currentIndex = index;
        var inserted = this.heap[currentIndex];
        // 요소를 적절한 위치로 상향 이동
        while (currentIndex > 0) {
            var parentIndex = Math.floor((currentIndex - 1) / 2);
            var parent_1 = this.heap[parentIndex];
            // 우선순위 먼저 비교, 동일하면 삽입 순서(낮은 값이 먼저)로 비교
            var priorityComparison = this.compareFn(inserted[1], parent_1[1]);
            if (priorityComparison > 0 || (priorityComparison === 0 && inserted[2] > parent_1[2]))
                break;
            // 부모 요소를 아래로 이동
            this.heap[currentIndex] = parent_1;
            currentIndex = parentIndex;
        }
        // 최종 위치에 삽입할 요소 배치
        this.heap[currentIndex] = inserted;
        return this.heap.length;
    };
    /**
     * 요소의 위치를 하향 조정 (힙 속성 유지)
     * @param index 하향 조정할 요소의 인덱스
     */
    PriorityQueue.prototype.siftDown = function (index) {
        var heapSize = this.heap.length;
        var element = this.heap[index];
        var currentIndex = index;
        // 요소를 적절한 위치로 하향 이동
        while (currentIndex < heapSize) {
            var leftChildIndex = 2 * currentIndex + 1;
            var rightChildIndex = 2 * currentIndex + 2;
            // 교체 대상이 될 자식 인덱스
            var swapIndex = -1;
            // 왼쪽 자식이 있고 현재 요소보다 우선순위가 높은 경우
            if (leftChildIndex < heapSize) {
                var leftChild = this.heap[leftChildIndex];
                var leftComparison = this.compareFn(leftChild[1], element[1]);
                // 우선순위가 높거나, 우선순위가 같지만 먼저 들어온 경우
                if (leftComparison < 0 || (leftComparison === 0 && leftChild[2] < element[2])) {
                    swapIndex = leftChildIndex;
                }
            }
            // 오른쪽 자식이 있는 경우
            if (rightChildIndex < heapSize) {
                var rightChild = this.heap[rightChildIndex];
                var rightComparison = this.compareFn(rightChild[1], element[1]);
                if (swapIndex === -1) {
                    // 왼쪽 자식이 선택되지 않았을 때, 오른쪽 자식과 현재 요소 비교
                    if (rightComparison < 0 || (rightComparison === 0 && rightChild[2] < element[2])) {
                        swapIndex = rightChildIndex;
                    }
                }
                else {
                    // 왼쪽 자식이 이미 선택된 경우, 오른쪽 자식과 왼쪽 자식 비교
                    var leftChild = this.heap[swapIndex];
                    var leftRightComparison = this.compareFn(rightChild[1], leftChild[1]);
                    if (leftRightComparison < 0 || (leftRightComparison === 0 && rightChild[2] < leftChild[2])) {
                        swapIndex = rightChildIndex;
                    }
                }
            }
            // 교체할 자식이 없으면 중단
            if (swapIndex === -1)
                break;
            // 자식과 위치 교체
            this.heap[currentIndex] = this.heap[swapIndex];
            currentIndex = swapIndex;
        }
        // 최종 위치에 요소 배치
        this.heap[currentIndex] = element;
    };
    /**
     * 큐의 내용을 문자열로 변환
     * @returns 큐의 내용을 표현하는 문자열
     */
    PriorityQueue.prototype.toString = function () {
        return this.heap.map(function (item) {
            return "".concat(String(item[0]), " (priority: ").concat(item[1], ", seq: ").concat(item[2], ")");
        }).join(', ');
    };
    return PriorityQueue;
}());
exports.PriorityQueue = PriorityQueue;
