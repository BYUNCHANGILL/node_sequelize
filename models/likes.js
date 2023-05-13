'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Likes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // 1. Likes 모델에서
      this.belongsTo(models.Users, {
        // 2. Users 모델에게 N:1 관계 설정을 합니다.
        targetKey: 'userId', // 3. Users 모델의 userId 컬럼을
        foreignKey: 'UserId', // 4. Likes 모델의 UserId 컬럼과 연결합니다.
      });

      // 1. Likes 모델에서
      this.belongsTo(models.Posts, {
        // 2. Posts 모델에게 N:1 관계 설정을 합니다.
        targetKey: 'postId', // 3. Posts 모델의 postId 컬럼을
        foreignKey: 'PostId', // 4. Likes 모델의 PostId 컬럼과 연결합니다.
      });
    }
  }
  Likes.init({
    likeId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    UserId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Users 모델을 참조합니다.
        key: 'userId',  // Users 모델의 userId를 참조합니다.
      },
      onDelete: 'CASCADE',  // 만약 Users 모델의 userId가 삭제되면, Comments 모델의 데이터가 삭제됩니다.
    },
    PostId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Posts', // Posts 모델을 참조합니다.
        key: 'postId',  // Posts 모델의 postId를 참조합니다.
      },  
      onDelete: 'CASCADE',  // 만약 Posts 모델의 postId가 삭제되면, Comments 모델의 데이터가 삭제됩니다.
    }
  }, {
    sequelize,
    modelName: 'Likes',
    timestamps: false // createdAt, updatedAt 컬럼을 사용하지 않습니다.
  });
  return Likes;
};