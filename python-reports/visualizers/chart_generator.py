"""
图表生成器模块
负责生成各种统计图表和可视化
"""

import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import io
import base64
from pathlib import Path

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

# 设置图表样式
sns.set_style("whitegrid")
sns.set_palette("husl")


class ChartGenerator:
    """
    图表生成器类
    负责根据数据生成各种统计图表
    """
    
    def __init__(self, output_dir: str = "charts"):
        """初始化图表生成器"""
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # 设置图表样式
        self.colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']
        self.figsize = (12, 8)
        
    def generate_charts(self, 
                       df: pd.DataFrame, 
                       report_type: str,
                       chart_types: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        生成图表集合
        
        Args:
            df: 数据DataFrame
            report_type: 报告类型
            chart_types: 图表类型列表
            
        Returns:
            图表路径字典
        """
        if chart_types is None:
            chart_types = self._get_default_charts(report_type)
        
        charts = {}
        
        for chart_type in chart_types:
            try:
                chart_path = self._generate_chart(df, chart_type, report_type)
                charts[chart_type] = chart_path
            except Exception as e:
                print(f"生成图表 {chart_type} 失败: {e}")
                continue
        
        return charts
    
    def _get_default_charts(self, report_type: str) -> List[str]:
        """获取默认图表类型"""
        default_charts = {
            "product_level_evaluation": [
                "sample_distribution",
                "variable_correlation",
                "quality_score_distribution",
                "missing_value_heatmap"
            ],
            "variable_level_evaluation": [
                "variable_distribution",
                "outlier_detection",
                "trend_analysis",
                "box_plot"
            ],
            "comparative_analysis": [
                "group_comparison",
                "time_series",
                "stacked_bar",
                "violin_plot"
            ]
        }
        
        return default_charts.get(report_type, ["sample_distribution"])
    
    def _generate_chart(self, df: pd.DataFrame, chart_type: str, report_type: str) -> str:
        """生成单个图表"""
        chart_methods = {
            "sample_distribution": self._create_sample_distribution,
            "variable_correlation": self._create_correlation_matrix,
            "quality_score_distribution": self._create_quality_score_chart,
            "missing_value_heatmap": self._create_missing_value_heatmap,
            "variable_distribution": self._create_variable_distribution,
            "outlier_detection": self._create_outlier_detection,
            "trend_analysis": self._create_trend_analysis,
            "box_plot": self._create_box_plot,
            "group_comparison": self._create_group_comparison,
            "time_series": self._create_time_series,
            "stacked_bar": self._create_stacked_bar,
            "violin_plot": self._create_violin_plot
        }
        
        method = chart_methods.get(chart_type)
        if method:
            return method(df, report_type)
        else:
            raise ValueError(f"不支持的图表类型: {chart_type}")
    
    def _create_sample_distribution(self, df: pd.DataFrame, report_type: str) -> str:
        """创建样本分布图"""
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        fig.suptitle('样本分布分析', fontsize=16, fontweight='bold')
        
        # 数值变量分布
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            for i, col in enumerate(numeric_cols[:4]):
                ax = axes[i//2, i%2]
                df[col].hist(bins=30, ax=ax, alpha=0.7, color=self.colors[i%len(self.colors)])
                ax.set_title(f'{col} 分布')
                ax.set_xlabel('值')
                ax.set_ylabel('频数')
        
        plt.tight_layout()
        
        chart_path = self.output_dir / f"sample_distribution_{report_type}.png"
        plt.savefig(chart_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(chart_path)
    
    def _create_correlation_matrix(self, df: pd.DataFrame, report_type: str) -> str:
        """创建相关性矩阵"""
        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.empty:
            return ""
        
        plt.figure(figsize=(12, 10))
        correlation_matrix = numeric_df.corr()
        
        mask = np.triu(np.ones_like(correlation_matrix, dtype=bool))
        
        sns.heatmap(
            correlation_matrix,
            mask=mask,
            annot=True,
            fmt='.2f',
            cmap='coolwarm',
            center=0,
            square=True,
            linewidths=0.5,
            cbar_kws={"shrink": 0.8}
        )
        
        plt.title('变量相关性矩阵', fontsize=16, fontweight='bold')
        plt.tight_layout()
        
        chart_path = self.output_dir / f"correlation_matrix_{report_type}.png"
        plt.savefig(chart_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(chart_path)
    
    def _create_quality_score_distribution(self, df: pd.DataFrame, report_type: str) -> str:
        """创建质量分数分布图"""
        # 计算质量分数（示例实现）
        quality_scores = []
        
        for col in df.columns:
            completeness = 1 - (df[col].isnull().sum() / len(df))
            uniqueness = df[col].nunique() / len(df)
            
            # 简单的质量评分
            quality_score = (completeness * 0.6 + uniqueness * 0.4) * 100
            quality_scores.append(quality_score)
        
        plt.figure(figsize=(12, 8))
        plt.hist(quality_scores, bins=20, alpha=0.7, color=self.colors[0])
        plt.axvline(np.mean(quality_scores), color='red', linestyle='--', 
                   label=f'平均分: {np.mean(quality_scores):.1f}')
        plt.xlabel('质量分数')
        plt.ylabel('变量数量')
        plt.title('变量质量分数分布', fontsize=16, fontweight='bold')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        chart_path = self.output_dir / f"quality_score_distribution_{report_type}.png"
        plt.savefig(chart_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(chart_path)
    
    def _create_missing_value_heatmap(self, df: pd.DataFrame, report_type: str) -> str:
        """创建缺失值热力图"""
        plt.figure(figsize=(14, 8))
        
        missing_data = df.isnull()
        sns.heatmap(
            missing_data,
            cmap='viridis',
            cbar=True,
            yticklabels=False,
            xticklabels=True
        )
        
        plt.title('缺失值分布热力图', fontsize=16, fontweight='bold')
        plt.xlabel('变量')
        plt.ylabel('样本')
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        
        chart_path = self.output_dir / f"missing_value_heatmap_{report_type}.png"
        plt.savefig(chart_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(chart_path)
    
    def _create_variable_distribution(self, df: pd.DataFrame, report_type: str) -> str:
        """创建变量分布图"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            return ""
        
        n_cols = min(len(numeric_cols), 6)
        n_rows = (n_cols + 1) // 2
        
        fig, axes = plt.subplots(n_rows, 2, figsize=(16, 4*n_rows))
        axes = axes.flatten() if n_rows > 1 else [axes]
        
        for i, col in enumerate(numeric_cols[:n_cols]):
            ax = axes[i]
            
            # 创建直方图和核密度估计
            ax.hist(df[col], bins=30, alpha=0.7, density=True, 
                   color=self.colors[i%len(self.colors)])
            
            # 添加核密度曲线
            try:
                sns.kdeplot(data=df[col], ax=ax, color='red', linewidth=2)
            except:
                pass
            
            ax.set_title(f'{col} 分布')
            ax.set_xlabel('值')
            ax.set_ylabel('密度')
        
        # 隐藏多余的子图
        for i in range(n_cols, len(axes)):
            fig.delaxes(axes[i])
        
        plt.suptitle('变量分布分析', fontsize=16, fontweight='bold')
        plt.tight_layout()
        
        chart_path = self.output_dir / f"variable_distribution_{report_type}.png"
        plt.savefig(chart_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(chart_path)
    
    def _create_outlier_detection(self, df: pd.DataFrame, report_type: str) -> str:
        """创建异常值检测图"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            return ""
        
        n_cols = min(len(numeric_cols), 4)
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        axes = axes.flatten()
        
        for i, col in enumerate(numeric_cols[:n_cols]):
            ax = axes[i]
            
            # 箱线图
            box_plot = ax.boxplot(df[col].dropna(), patch_artist=True)
            
            # 设置颜色
            for patch in box_plot['boxes']:
                patch.set_facecolor(self.colors[i%len(self.colors)])
                patch.set_alpha(0.7)
            
            ax.set_title(f'{col} 异常值检测')
            ax.set_ylabel('值')
            ax.grid(True, alpha=0.3)
        
        # 隐藏多余的子图
        for i in range(n_cols, len(axes)):
            fig.delaxes(axes[i])
        
        plt.suptitle('异常值检测分析', fontsize=16, fontweight='bold')
        plt.tight_layout()
        
        chart_path = self.output_dir / f"outlier_detection_{report_type}.png"
        plt.savefig(chart_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(chart_path)
    
    def _create_trend_analysis(self, df: pd.DataFrame, report_type: str) -> str:
        """创建趋势分析图"""
        # 假设有日期列
        date_cols = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
        
        if not date_cols:
            # 如果没有日期列，使用索引作为时间轴
            plt.figure(figsize=(14, 8))
            
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for i, col in enumerate(numeric_cols[:5]):
                plt.plot(df.index, df[col], 
                        label=col, 
                        color=self.colors[i%len(self.colors)],
                        linewidth=2)
            
            plt.title('变量趋势分析', fontsize=16, fontweight='bold')
            plt.xlabel('样本索引')
            plt.ylabel('值')
            plt.legend()
            plt.grid(True, alpha=0.3)
            
        else:
            date_col = date_cols[0]
            try:
                df[date_col] = pd.to_datetime(df[date_col])
                df = df.sort_values(date_col)
                
                plt.figure(figsize=(14, 8))
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                
                for i, col in enumerate(numeric_cols[:5]):
                    plt.plot(df[date_col], df[col], 
                           label=col, 
                           color=self.colors[i%len(self.colors)],
                           linewidth=2)
                
                plt.title('变量时间序列趋势', fontsize=16, fontweight='bold')
                plt.xlabel('时间')
                plt.ylabel('值')
                plt.legend()
                plt.grid(True, alpha=0.3)
                plt.xticks(rotation=45)
                
            except:
                plt.figure(figsize=(14, 8))
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                for i, col in enumerate(numeric_cols[:5]):
                    plt.plot(df.index, df[col], 
                           label=col, 
                           color=self.colors[i%len(self.colors)],
                           linewidth=2)
        
        plt.tight_layout()
        chart_path = self.output_dir / f"trend_analysis_{report_type}.png"
        plt.savefig(chart_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(chart_path)
    
    def _create_box_plot(self, df: pd.DataFrame, report_type: str) -> str:
        """创建箱线图"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            return ""
        
        plt.figure(figsize=(14, 8))
        
        # 创建箱线图
        box_data = [df[col].dropna() for col in numeric_cols]
        box_plot = plt.boxplot(box_data, labels=numeric_cols, patch_artist=True)
        
        # 设置颜色
        colors = [self.colors[i%len(self.colors)] for i in range(len(numeric_cols))]
        for patch, color in zip(box_plot['boxes'], colors):
            patch.set_facecolor(color)
            patch.set_alpha(0.7)
        
        plt.title('变量箱线图分析', fontsize=16, fontweight='bold')
        plt.xlabel('变量')
        plt.ylabel('值')
        plt.xticks(rotation=45, ha='right')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        chart_path = self.output_dir / f"box_plot_{report_type}.png"
        plt.savefig(chart_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(chart_path)
    
    def _create_group_comparison(self, df: pd.DataFrame, report_type: str) -> str:
        """创建分组对比图"""
        # 假设有分类变量
        categorical_cols = df.select_dtypes(include=['object']).columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        if len(categorical_cols) == 0 or len(numeric_cols) == 0:
            return ""
        
        cat_col = categorical_cols[0]
        num_col = numeric_cols[0]
        
        plt.figure(figsize=(14, 8))
        
        # 分组箱线图
        sns.boxplot(data=df, x=cat_col, y=num_col, palette=self.colors)
        
        plt.title(f'{num_col} 按 {cat_col} 分组对比', fontsize=16, fontweight='bold')
        plt.xlabel(cat_col)
        plt.ylabel(num_col)
        plt.xticks(rotation=45, ha='right')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        chart_path = self.output_dir / f"group_comparison_{report_type}.png"
        plt.savefig(chart_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(chart_path)
    
    def _create_time_series(self, df: pd.DataFrame, report_type: str) -> str:
        """创建时间序列图"""
        return self._create_trend_analysis(df, report_type)
    
    def _create_stacked_bar(self, df: pd.DataFrame, report_type: str) -> str:
        """创建堆叠柱状图"""
        categorical_cols = df.select_dtypes(include=['object']).columns
        
        if len(categorical_cols) < 2:
            return ""
        
        cat_col1 = categorical_cols[0]
        cat_col2 = categorical_cols[1]
        
        # 创建交叉表
        cross_tab = pd.crosstab(df[cat_col1], df[cat_col2])
        
        plt.figure(figsize=(14, 8))
        cross_tab.plot(kind='bar', stacked=True, color=self.colors[:len(cross_tab.columns)])
        
        plt.title(f'{cat_col1} vs {cat_col2} 堆叠分析', fontsize=16, fontweight='bold')
        plt.xlabel(cat_col1)
        plt.ylabel('数量')
        plt.legend(title=cat_col2)
        plt.xticks(rotation=45, ha='right')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        chart_path = self.output_dir / f"stacked_bar_{report_type}.png"
        plt.savefig(chart_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(chart_path)
    
    def _create_violin_plot(self, df: pd.DataFrame, report_type: str) -> str:
        """创建小提琴图"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        if len(numeric_cols) == 0:
            return ""
        
        plt.figure(figsize=(14, 8))
        
        # 创建小提琴图
        data_for_violin = [df[col].dropna() for col in numeric_cols]
        
        plt.violinplot(data_for_violin, showmeans=True)
        plt.xticks(range(1, len(numeric_cols) + 1), numeric_cols, rotation=45, ha='right')
        
        plt.title('变量分布小提琴图', fontsize=16, fontweight='bold')
        plt.xlabel('变量')
        plt.ylabel('值')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        chart_path = self.output_dir / f"violin_plot_{report_type}.png"
        plt.savefig(chart_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(chart_path)
    
    def chart_to_base64(self, chart_path: str) -> str:
        """将图表转换为base64编码"""
        with open(chart_path, 'rb') as f:
            return base64.b64encode(f.read()).decode()
    
    def cleanup_charts(self):
        """清理生成的图表文件"""
        for file in self.output_dir.glob("*.png"):
            file.unlink()